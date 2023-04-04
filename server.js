const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true}))
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
//  세션 방식 로그인 위한 라이브러리 require
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
//  미들웨어  = 요청 응답 중간에 동작하는 코드  app.use(동작 코드) 
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


// 미들웨어 요청이랑 응답사이에 존재하는 자바스크립트
app.use('/public', express.static('public'));

let db;

// MongoDB에 연결
MongoClient.connect(
    'mongodb+srv://sangil6372:a8356372@cluster0.yxzynwi.mongodb.net/?retryWrites=tr' +
            'ue&w=majority',
    function (에러, client) {

        // 연결 안될 경우
        if (에러) {
            return console.log(에러);
        }

        // todoapp이라는 database(폴더)에 연결
        db = client.db('todoapp');

        // db에 데이터 저장
        db
            .collection('post')
            .insertOne({
                이름: 'sangil',
                _id: 25
            }, function (에러, 결과) {
                console.log('저장완료');
            });

        // 포트번호 8080에서 웹서버를 시작한다  localhost:8080  web 서버 시작되면 listening on 8080 이라는 메세지
        // 출력함
        app.listen(8080, function () {
            console.log('listening on 8080');
        });

    }
);

app.get('/', function (요청, 응답) {
    응답.render('index.ejs');
});

app.get('/write', function (요청, 응답) {
    응답.render('write.ejs');
});

app.post('/add', function (요청, 응답) {
    // 유저가 보낸 데이터 어딘가 저장하는게 좋겠군요  txt 파일 만들어서 거기 저장해도 가능  엑셀에 저장해도 좋고 근데 가로줄 1억게 저장
    // 가능? 개느려짐  Database에 저장합시다
    응답.send('전송완료');
    console.log(요청.body);

    db
        .collection('count')
        .findOne({
            name: '게시물갯수'
        }, function (에러, 결과) {
            let 총게시물갯수 = 결과.totalPost;

            db
                .collection('post')
                .insertOne({
                    _id: 총게시물갯수 + 1,
                    제목: 요청.body.title,
                    날짜: 요청.body.date
                }, function (에러, 결과) {
                    console.log('저장완료');
                    // 저장했으면 totalPost 1올려줘야 되자나
                    db
                        .collection('count')
                        .updateOne({
                            name: '게시물갯수'
                        }, {
                            $inc: {
                                totalPost: 1
                            }
                        }, function (에러, 결과) {
                            if (에러) {
                                return console.log(에러);
                            }
                        })
                });
        })

});

app.get('/list', function (요청, 응답) {
    //  file명 post를 다루겠다~ 전체 다 찾겠다~
    db
        .collection('post')
        .find()
        .toArray(function (에러, 결과) {
            console.log(결과);
            // 결과data를 posts로 사용하겠다~
            응답.render('list.ejs', {posts: 결과});
        })

});

app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    // 요청.body에는 아이디가 있어야 함 요청.body에 id를 형변환 시켜줘야함 - 문자열로 인식하기 때문
    요청.body._id = parseInt(요청.body._id);

    db
        .collection('post')
        .deleteOne(요청.body, function (에러, 결과) {
            console.log('삭제 완료');
            // 서버에서 요청 응답해주는 법
            응답
                .status(200)
                .send({message: '성공했습니다'});
        })

})

// 파라미터 문법 쓰자 :id (id 는 파라미터라서 아무렇게나 써도 됨)
app.get('/detail/:id', function (요청, 응답) {
    // 그러면 요청한 id 대로 페이지 띄워줘야지 ㅇㅇ 사용자가 url(요청)에 입력한 아이디는 요청.params.id (이런건 구글검색하자)
    db
        .collection('post')
        .findOne({
            _id: parseInt(요청.params.id)
        }, function (에러, 결과) {
            응답.render('detail.ejs', {data: 결과});
        })
})

app.get('/edit/:id', function (요청, 응답) {
    db
        .collection('post')
        .findOne({
            _id: parseInt(요청.params.id)
        }, function (에러, 결과) {
            if (에러) 
                console.log(에러);
            응답.render('edit.ejs', {post: 결과});
        })
})

app.put('/edit', function (요청, 응답) {
    db
        .collection('post')
        .updateOne({
            _id: parseInt(요청.body.id)
        }, {
            $set: {
                제목: 요청.body.title,
                날짜: 요청.body.date
            }
        },function(에러, 결과){
            // 업데이트가 됐으면 다른 페이지 
            if (에러){
                console.log(에러);
            }
            // 여기선 이제 render가 아니라 redirect를 사용해야함
            응답.redirect('/list');
        })

})

app.get('/login', function (요청, 응답){
    응답.render('login.ejs');
})

app.post('/login', passport.authenticate('local',{failureRedirect: '/fail'}) , 
function(요청, 응답){
    // post 요청이 들어오면 확인하고 redirect
    응답.redirect('/');


})

// passport 라이브러리 예제코드 비밀번호 인증
// localStrategy() = 로컬방식으로 검사 
passport.use(new LocalStrategy({
    // 사용자가 제출한 아이디 어디 적혔는지
    usernameField: 'id',
    // 사용자가 제출한 비번 어디 적혔는지
    passwordField: 'pw',
    // 세션 만들건지
    session: true,
    // 아이디 비번 말고 다른 정보 검사가 필요한지
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

//   user 정보 세션으로 저장
  passport.serializeUser(function(user, done){
    done(null,user.id);
  })

  passport.deserializeUser(function(아이디, done){
    done(null, {});
  })
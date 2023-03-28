const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true}))
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

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

        app.listen(8080, function () {
            console.log('listening on 8080');
        });

    }
);

app.get('/', function (요청, 응답) {
    응답.sendFile(__dirname + '/index.html');
});

app.get('/write', function (요청, 응답) {
    응답.sendFile(__dirname + '/write.html');
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

app.delete('/delete',function(요청, 응답){
    console.log(요청.body);
    // 요청.body에는 아이디가 있어야 함 
     
    // 요청.body에 id를 형변환 시켜줘야함 - 문자열로 인식하기 때문
    요청.body._id = parseInt(요청.body._id);

    db.collection('post').deleteOne(요청.body,function(에러, 결과){
        console.log('삭제 완료');
        // 서버에서 요청 응답해주는 법
        응답
        .status(200)
        .send({message: '성공했습니다'});
    })

})

// 파라미터 문법 쓰자 :id (id 는 파라미터라서 아무렇게나 써도 됨)
app.get('/detail/:id',function(요청,응답){
    //  그러면 요청한 id 대로 페이지 띄워줘야지 ㅇㅇ
    // 사용자가 url(요청)에 입력한 아이디는 요청.params.id (이런건 구글검색하자)
    db.collection('post').findOne({_id: parseInt(요청.params.id)},function(에러,결과){
        응답.render('detail.ejs', {data: 결과});
    })






})
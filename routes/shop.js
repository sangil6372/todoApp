// express 라이브러리의 Router()라는 함수를 사용할거임
var router = require('express').Router();

// login 할 때 미들웨어 로그인 여부
function 로그인했니(요청, 응답, next) {
    // 사용자(요청.user)가 있으면
    if (요청.user) {
        next();
    } else {
        응답.send('로그인 안하셨는데요?');
    }
}

// 분리해서 관리하고 싶은 라우트들
router.get('/shirts',로그인했니, function(요청, 응답){
    응답.send('셔츠 파는 페이지입니다.');
 });
 
router.get('/pants', 로그인했니, function(요청, 응답){
    응답.send('바지 파는 페이지입니다.');
 }); 

 module.exports = router;
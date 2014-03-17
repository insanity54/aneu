// user module. loads user from database and returns that user's info

var get_twitter = function(id, done) {
    // makes a db call to our db using the supplied twitter id. returns user info.

    // fake database call // @todo make this a real db call
    user = {
        "hiscore": 9001,
        "medals":
        [ 'viralvideo',
          'megapunch',
          'teamwork' ],
        "points": 654
    };

    done(null, user);
};
    

var create = function(profile, done){

    done(null, 'creation station');
}


module.exports = {
    get_twitter: get_twitter,
    create: create
}

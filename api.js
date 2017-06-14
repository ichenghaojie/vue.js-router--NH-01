var config = {
    databaseURL: "https://hacker-news.firebaseio.com"
};

firebase.initializeApp(config);

var api = firebase.database().ref('/v0');

var listData = [];
var maxNum =1;
// cache the latest story ids
api.__ids__ = {};
function initData(){
	
// ['top', 'new', 'show', 'ask', 'job'].forEach(type => {
//     api.child(`${type}stories`).on('value', snapshot =>{
//         api.__ids__[type] = snapshot.val()
//     })
// });

	['top', 'new', 'show', 'ask', 'job'].forEach(type => {
		return new Promise(function(resolve,reject){
			api.child(`${type}stories`).on('value', snapshot =>{
		        api.__ids__[type] = snapshot.val()
		        resolve()
		    })
		}).then(function(){
			warmCache()
		})
	});
}

//warm the front page cache every 15 mins
//setTimeout(warmCache, 2000);
function warmCache(type) {
	//maxNum=Math.ceil(api.__ids__.top.length/30);
	
    getItems((api.__ids__[type] || [] ).slice(0, 30));
    setTimeout(warmCache, 1000*15*60);
};
function getItems(ids){
	listData.length = 0;
	ids.map(function(id){
		return new Promise(function(resolve,reject){
			api.child('item/'+id).once('value',function(snapshot){
				const val = snapshot.val();
				listData.push(val);
				resolve(val)
			},reject)
		})
	})
	
}

// function updateItems(num){
// 	console.log(num);
// 	getItems((api.__ids__.top || [] ).slice((num-1)*30, num*30));
// }









// use Promise here to ensure have got datas before rendering
function fetch(child) {
    return new Promise((resolve, reject) => {
        api.child(child).once('value', snapshot => {
            const val = snapshot.val();
            console.log(val);
            resolve(val);
        }, reject)
    })
};

function fetchIdsByType(type) {
    return api.__ids__[type]
    ? Promise.resolve(api.__ids__[type])
    : fetch(`${type}stories`)
};

function fetchItem(id) {
    return fetch(`item/${id}`)
};

function fetchItems(ids) {
    return Promise.all(ids.map(id => fetchItem(id)))
};

function fetchUser(id) {
    return fetch(`user/${id}`)
};
function watchList(type, cb) {
    let first = true;
    const ref = api.child(`${type}stories`);
    const handler = snapshot => {
        if(first){
            first = false;
        }else {
            cb(snapshot.val())
        }
    };
    ref.on('value', handler)
    return () => {
        ref.off('value', handler)
    }
}

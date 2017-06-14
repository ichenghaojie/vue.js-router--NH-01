console.log(listData);
var itemList = Vue.extend({
    template:'#itemlist',
    name:'item-list',
    data:function(){
        return {
        	items:listData,
        	page:1,
        	allItem:api.__ids__.top,
            maxPage: 1,
            type:'top'
        } 
    },
    computed: {
    	// maxPage(){
    		
    	// 		console.log(this.allItem.length);
    	// 	return Math.ceil(this.allItem.length/30) 
    		
    	// },
    	hasMore(){
    		return this.page<this.maxPage
    	}
    },
    created: function(){
    	this.type = this.$route.fullPath.split('/')[1];
    	this.page = this.$route.params.id;
    	console.log(this.type);
    	console.log(this.page);
    	var self = this;
    	return new Promise(function(resolve,reject){
			api.child(self.type+'stories').on('value', snapshot =>{
		        api.__ids__[self.type] = snapshot.val()
		        resolve()
		    })
		}).then(function(){
			self.maxPage=Math.ceil(api.__ids__[self.type].length/20);
			warmCache(self.type,self.page);
		})
    },
    methods:{
    	updateItems:function (num){
			getItems((api.__ids__[this.type] || [] ).slice((num-1)*20, num*20));
		}

    },
    filters:{
    	urlHost:function(url){
			if(url){
		    const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
		    const parts = host.split('.').slice(-3)
		    if(parts[0] === 'www') parts.shift()
		    return parts.join('.')
			}
		},
		timeAgo:function(time){
		    var betweenTime = (new Date().getTime()/1000)-time;
			function pluralize(time,lable){
				if(time===1){
					return time+lable;
				}else{
					return time+lable+'s'
				}
			}
			if(betweenTime<3600){
				return pluralize(~~(betweenTime/60),'minue')
			}else if(betweenTime<86400){
				return pluralize(~~(betweenTime/3600),'hour')
			}else if(betweenTime>86400){
				return pluralize(~~(betweenTime/86400),'day')
			}
		}
    }
})
var userList = Vue.extend({
    template:'#userview',
    name:'user-list',
    data:function(){
    	return{
           user:{}
    	}
    },

    computed:{
    	userPage(){
    		console.log(this.$route.params.id?true:false);
    		return this.$route.params.id?true:false;
    	}
    },
    created:function(){
    	var self = this;
    	return new Promise(function(resolve,reject){
			api.child("user/"+self.$route.params.id).on('value', snapshot =>{
		        self.user = snapshot.val()
		        console.log(self.user)
		        resolve()
		    })
		})
    },
    filters:{
    	timeAgo:function(time){
    		var betweenTime = (new Date().getTime()/1000)-time;
			function pluralize(time,lable){
				if(time===1){
					return time+lable;
				}else{
					return time+lable+'s'
				}
			}
			if(betweenTime<3600){
				return pluralize(~~(betweenTime/60),'minue')
			}else if(betweenTime<86400){
				return pluralize(~~(betweenTime/3600),'hour')
			}else if(betweenTime>86400){
				return pluralize(~~(betweenTime/86400),'day')
			}
    	}
    }
})



var CommentView = Vue.extend({
	template:'#commentview',
	name:'commentView',
	props: ['id'],
	data(){
		return{
			comment:{},
			open: true
		}
	},
	computed:{
		isFolder: function () {
			return this.comment.kids&&this.comment.kids.length
		}
	},
	created(){
		var self = this;
    	return new Promise(function(resolve,reject){
    		console.log(self.id);
			api.child("item/"+self.id).on('value', snapshot =>{
		        self.comment = snapshot.val()
		        console.log(self.comment)
		        resolve()
		    })
		})
	},
    filters:{
    	urlHost:function(url){
			if(url){
		    const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
		    const parts = host.split('.').slice(-3)
		    if(parts[0] === 'www') parts.shift()
		    return parts[0]+'.'+parts[1]
			}
		},
		timeAgo:function(time){
		    var betweenTime = (new Date().getTime()/1000)-time;
			function pluralize(time,lable){
				if(time===1){
					return time+lable;
				}else{
					return time+lable+'s'
				}
			}
			if(betweenTime<3600){
				return pluralize(~~(betweenTime/60),'minue')
			}else if(betweenTime<86400){
				return pluralize(~~(betweenTime/3600),'hour')
			}else if(betweenTime>86400){
				return pluralize(~~(betweenTime/86400),'day')
			}
		},
	    pluralize:function(num){
	    	if(num===1){
				return num+'reply';
			}else{
				return num+'replies';
			}
	    }
    },
    methods:{
    	toggle:function(){
    		this.open=!this.open;
    	}
    }
})

var itemView = Vue.extend({
	template:'#itemview',
	name:'item-view',
	components:{CommentView},
	data(){
		return{
			item:{}
		}
	},
	created(){
		var self = this;
    	return new Promise(function(resolve,reject){
			api.child("item/"+self.$route.params.id).on('value', snapshot =>{
		        self.item = snapshot.val()
		        console.log(self.item)
		        resolve()
		    })
		})
	},
    filters:{
    	urlHost:function(url){
			if(url){
		    const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
		    const parts = host.split('.').slice(-3)
		    if(parts[0] === 'www') parts.shift()
		    return parts[0]+'.'+parts[1]
			}
		},
		timeAgo:function(time){
		    var betweenTime = (new Date().getTime()/1000)-time;
			function pluralize(time,lable){
				if(time===1){
					return time+lable;
				}else{
					return time+lable+'s'
				}
			}
			if(betweenTime<3600){
				return pluralize(~~(betweenTime/60),'minue')
			}else if(betweenTime<86400){
				return pluralize(~~(betweenTime/3600),'hour')
			}else if(betweenTime>86400){
				return pluralize(~~(betweenTime/86400),'day')
			}
		}
    }
})

const router = new VueRouter({
	routes: [
	    // 动态路径参数 以冒号开头
	    { path: '/item/:id', component: itemView },
	    { path: '/user/:id', component: userList },
	    { path: '/top/:id', component:itemList},
	    { path:'/new/:id',component:itemList},
	    { path:'/show/:id',component:itemList},
	    { path:'/ask/:id',component:itemList},
	    { path:'/job/:id',component:itemList},
	    { path: '/', redirect: '/top/1' }
	]

});



var app = new Vue({
    router
}).$mount('#app')
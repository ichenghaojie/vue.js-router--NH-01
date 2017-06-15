console.log(listData);
var itemList = Vue.extend({
    template:'#itemlist',
    name:'item-list',
    data:function(){
        return {
        	items:listData,
        	page:1,
        	allItem:api.__ids__.top,
            maxPage:1,
            type:'top',
            transition:'slide-left',
            dispaly:1
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

    beforeRouteEnter: function(to, from, next) {
		console.log('enter',to.path);
		next(vm => {
			console.log('path', vm.$route.path)
			vm.getData();
		});
	},
	beforeRouteUpdate: function(to, from, next) {
		console.log('update',to.path);
        next();
	},
    created: function(){
    	this.getData();
    },
    methods:{
    	updateItems:function (start,end){
            this.transition = start>end?'slide-left':'slide-right';
            this.page=end;
   
            console.log(start>end,this.transition);
			getItems((api.__ids__[this.type] || [] ).slice((end-1)*20, end*20));
		},
		getData:function(){
			console.log(this.$route);
			this.type = this.$route.fullPath.split('/')[1];
			this.page = this.$route.params.id? this.$route.params.id:1 ;

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
	    { path: '/item/:id(\\d+)?', component: itemView },
	    { path: '/user/:id(\\d+)?', component: userList },
	    { path: '/top/:id(\\d+)?', component:itemList},
	    { path:'/new/:id(\\d+)?',component:itemList},
	    { path:'/show/:id(\\d+)?',component:itemList},
	    { path:'/ask/:id(\\d+)?',component:itemList},
	    { path:'/job/:id(\\d+)?',component:itemList},
	    { path: '/', redirect: '/top' }
	]

});



var app = new Vue({
    router
}).$mount('#app')
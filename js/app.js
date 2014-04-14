
module = angular.module('Localist',['ngSanitize','ngRoute']);

module.config(function($locationProvider,$routeProvider){
	$locationProvider.hashPrefix='#!';
	$routeProvider.when('/edit',{
		templateUrl:"/html/editor.html"
	});
	$routeProvider.when('/search/:scope*',{
		templateUrl:"/html/search.html"
	})
	$routeProvider.otherwise({redirectTo:'/search/primary/dash'});
});

module.filter("marked",(function(){
	return function(data){
		return marked(data);
	};
}));

module.factory("Storage",(function($q){
	var storage = {
		mechanism:(function(lawn){
			var that = this;
			that.loadCurrentPost = (function(){
				var promise = $q.defer();
				lawn.exists("currentPost",(function(exists){
					if(exists){
						lawn.get("currentPost",promise.resolve);
					} else promise.resolve(null);
				}));
				return promise.promise;
			});
			that.setCurrentPost = (function(postdata) {
				var promise = $q.defer();
				lawn.save({
					key:"currentPost",
					postID:postdata.key
				},promise.resolve);
				return promise.promise;
			});
			that.loadPost = (function(postID){
				var promise = $q.defer();
				lawn.get(postID,(function(data){
					if(data)
						promise.resolve(data);
					else
						promise.reject(null);
				}));
				return promise.promise;
			});
			that.savePost = (function(postData){
				var promise = $q.defer();
				postData.modified=Date.now();
				lawn.save(postData,(function(){
					promise.resolve(postData);
				}));
				return promise.promise;
			});
			that.createPost = (function(postData){
				postData.created=Date.now();
				return that.savePost(postData);
			});
			that.deletePost = (function(postData){
				var promise = $q.defer();
				lawn.remove(postData.key,promise.resolve);
				return promise.promise;
			});
			that.searchPost = (function(queryString){
				var promise = $q.defer();
				lawn.batch([{type:'post'}],(function(){
					this.each(function(record,index){
					});
					promise.resolve([]);
				}));
				return promise.promise;
			});
			return that;
		}),
		prepare:(function(){
			var promise = $q.defer();
			Lawnchair({
				name:"Localist"
			},(function(lawn){
				promise.resolve(new storage.mechanism(lawn));
			}));
			return promise.promise;
		})
	};
	return storage;
}));

module.controller('Editor',(function($scope,Storage){
	$scope.readyState = 0;
	$scope.post = {markDown:"",name:null,tags:"",type:'post'};
	$scope.deletePost = (function(){
		$scope.readyState = 1;
		Storage.prepare().then(function(mechanism){
			mechanism.deletePost($scope.post).then((function(){
				mechanism.setCurrentPost({key:null}).then($scope.reload);
			}));
		});
	});
	$scope.savePost = (function(){
		Storage.prepare().then(function(mechanism){
			var promise = $scope.post.key?mechanism.savePost:mechanism.createPost;
			promise = promise($scope.post);
			promise.then(mechanism.setCurrentPost);
		});
	});
	$scope.reload = (function(){
		Storage.prepare().then(function(mechanism){
			mechanism.loadCurrentPost().then(function(currentPost){
				if(currentPost===null||currentPost.postID===null) {
					$scope.post = {markDown:"",name:null,tags:"",type:'post'};
					$scope.readyState = 2;
				} else mechanism.loadPost(currentPost.postID).then((function (post) {
					$scope.post = post;
					$scope.readyState = 2;
				}));
			});
		});
	});
	$scope.reload();
}));

module.controller("SearchEngine",(function($scope,$routeParams,Storage){
	$scope.readyState = 0;
	$scope.posts = [];
	Storage.prepare().then(function(mechanism){
		mechanism.searchPosts($routeParams.scope||"").then(function(results){
			$scope.posts = results;
			$scope.readyState = 1;
		});
	});
}));
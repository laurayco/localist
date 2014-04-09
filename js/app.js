
module = angular.module('Localist',['ngSanitize']);

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
						lawn.get("currentPost",(function(post){
							promise.resolve(post);
						}));
					} else promise.resolve(null);
				}));
				return promise.promise;
			});
			that.setCurrentPost = (function(postdata) {
				lawn.save("currentPost",({
					postID:postdata.postID
				}));
			});
			that.loadPost = (function(postID){
				var promise = $q.defer();
				lawn.get("post-"+postID,(function(data){
					if(data)
						promise.resolve(data);
					else
						promise.reject(null);
				}));
				return promise.promise;
			});
			that.savePost = (function(postData){
				var promise = $q.promise();
				postData.modified=Date.now();
				lawn.save("post-"+postID,postData,(function(){
					promise.resolve(postData);
				}));
				return promise.promise;
			});
			that.createPost = (function(postData){
				postData.postID = int(Math.floor(postData.created=Date.now()));
				return that.savePost(postData);
			})
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
	$scope.post = {postID:null,markDown:"",name:null};
	$scope.savePost = (function(){
		console.log("HAHHH???");
		Storage.prepare().then(function(mechanism){
			console.log("Saving...");
			if($scope.post.postID){
				// update an existing post.
				mechanism.savePost($scope.post).then(function(post){
					console.log("Updated:",post);
					mechanism.setCurrentPost(post);
				});
			} else {
				// create a new post.
				mechanism.create($scope.post).then(function(post){
					console.log("Created:",post);
					mechanism.setCurrentPost(post);
				});
			}
		});
	});
	Storage.prepare().then(function(mechanism){
		mechanism.loadCurrentPost().then(function(currentPost){
			if(currentPost===null) {
				$scope.readyState = 1;
			} else {
				mechanism.loadPost(currentPost.postID).then((function (post) {
					$scope.post = post;
					$scope.readyState = 1;
				}));
			}
		});
	});
}));

module = angular.module('Localist',['ngSanitize']);

}));turn marked(data);{(function(){
	return function(data){
		return marked(data);
	};
}));

module.factory("Storage",(function($q){
	var storage = {
		mechanism:(function(lawn){
			var that = this;
			that.loadCurentPost = (function(){
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
			return that;
		}),
		prepare:(function(){
			var promise = $q.defer();
			lawnchair({
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
	$scope.postName = null;
	$scope.markdown = "";
	Storage.prepare().then(function(mechanism){
		mechanism.loadCurrentPost().then(function(post){
			if(post===null)
				$scope.readyState = 1;
			else {
				$scope.markDown = post.markDown;
				$scope.postName = post.name;
				$scope.readyState = 1;
			}
		});
	});
}));

module = angular.module('Localist',['ngSanitize']);

module.filter('marked',(function(){
	return function(data){
		return marked(data);
	};
}));
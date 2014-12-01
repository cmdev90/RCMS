

(function (document, window, $, Backbone, _){

	window.RCMS = {
		Routers			: {},
		Views 			: {},
		Models			: {},
		Collections		: {},
		templateLoader 	: {}
	};



	RCMS.Models.AuthenticationModel = Backbone.Model.extend({

		defaults: {
	        loggedIn: false,
	        apiKey: null
	    },

	    initialize: function () {
	        this.bind('change:apiKey', this.onApiKeyChange, this);
	        this.set({'apiKey': $.jStorage.get('apiKey')});
	    },

	    onApiKeyChange: function (status, apiKey) {
	        this.set({'loggedIn': !!apiKey});
	    },

	    setApiKey: function(apiKey) {
	        $.jStorage.set('apiKey', apiKey)
	        this.set({'apiKey': apiKey});
	    },

	    setUser : function(userObj){	    		    
	    	$.jStorage.set('firstname', userObj.firstname);
	    	$.jStorage.set('lastname', userObj.lastname);
	    	$.jStorage.set('password', userObj.password);
	    	$.jStorage.set('email', userObj.RowKey);	    	
	    	$.jStorage.set('app_count', userObj.app_count);	    	
	    	$.jStorage.set('partition', userObj.PartitionKey);
	    }
	})



	RCMS.Models.Register = Backbone.Model.extend({		

		urlRoot : '/create/user',

		initialize: function(){	
			console.log('sending data to:' + this.urlRoot);		
		},

		defaults: {			
			"password" 	: "",
			"firstname" : "",
			"lastname"	: "",
			"email"		: ""
	    }
	});

	RCMS.Models.ApplicationModel = Backbone.Model.extend({				
		urlRoot : '/save/user/app',

		initialize: function(){	
			console.log('app model');		
		}
	});	

	// RCMS.Collections.ApplicationCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.ApplicationModel,
	// 	url 	: '/get/all/packages'
	// });


	RCMS.Models.LocationModel = Backbone.Model.extend({				

		initialize: function(){	
			console.log('packages model');		
		},

		defaults: {
			"id"		: "none",
			"name" 		: "none"	
	    }
	});	

	RCMS.Collections.LocationsCollection = Backbone.Collection.extend({
		model 	: RCMS.Models.LocationModel,
		url 	: '/get/all/locations'
	});




	// RCMS.Models.PackagesModel = Backbone.Model.extend({				

	// 	initialize: function(){	
	// 		console.log('packages model');		
	// 	},

	// 	defaults: {
	// 		"name"			: "none",
	// 		"nodes" 		: "none",
	// 		"messaging" 	: "none",
	// 		"note" 			: "none",
	// 		"users" 		: "none",
	// 		"voice" 		: "none",
	// 		"security" 		: "none",
	// 		"extensions" 	: "none",
	// 		"cost"			: "$0 US per month"	
	//     }
	// });	

	// RCMS.Collections.PackagesCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.PackagesModel,
	// 	url 	: '/get/all/packages'
	// });

}(document, this, jQuery, Backbone, _));
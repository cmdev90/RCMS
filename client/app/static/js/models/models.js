

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
	    	$.jStorage.set('username', userObj.PartitionKey);	    	
	    	$.jStorage.set('firstname', userObj.firstname);
	    	$.jStorage.set('lastname', userObj.lastname);
	    	$.jStorage.set('password', userObj.RowKey);
	    	$.jStorage.set('email', userObj.email);
	    	$.jStorage.set('package', userObj.package);
	    }
	});



	RCMS.Models.Register = Backbone.Model.extend({		

		urlRoot : 'http://localhost:5000/create/user',

		initialize: function(){	
			console.log('sending data to:' + this.urlRoot);		
		},

		defaults: {
			"username" 	: "",
			"password" 	: "",
			"firstname" : "",
			"lastname"	: "",
			"email"		: ""
	    }
	});


	RCMS.Models.PackagesModel = Backbone.Model.extend({				

		initialize: function(){	
			console.log('packages model');		
		},

		defaults: {
			"name"			: "none",
			"nodes" 		: "none",
			"messaging" 	: "none",
			"note" 			: "none",
			"users" 		: "none",
			"voice" 		: "none",
			"security" 		: "none",
			"extensions" 	: "none",
			"cost"			: "$0 US per month"	
	    }
	});	

	RCMS.Collections.PackagesCollection = Backbone.Collection.extend({
		model 	: RCMS.Models.PackagesModel,
		url 	: 'http://localhost:5000/get/all/packages'
	});


	// RCMS.Models.OrderDetailsModel = Backbone.Model.extend({		

	// 	initialize: function(){	
	// 		console.log('getting data from:');		
	// 	}
	// });

	// RCMS.Collections.OrderDetailsCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.OrderDetailsModel		
	// });


	// RCMS.Models.StandingOrderDetailsModel = Backbone.Model.extend({		

	// 	initialize: function(){	
	// 		console.log('getting data from:');		
	// 	}
	// });

	// RCMS.Collections.StandingOrderDetailsCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.StandingOrderDetailsModel		
	// });

	// RCMS.Models.RemoveModel = Backbone.Model.extend({		

	// 	initialize: function(){	
	// 		console.log('getting data from:');		
	// 	}
	// });

}(document, this, jQuery, Backbone, _));
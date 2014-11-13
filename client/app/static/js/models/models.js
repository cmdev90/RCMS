

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
	    }
	});



	// RCMS.Models.CustomerModel = Backbone.Model.extend({		

	// 	initialize: function(){	
	// 		console.log('getting data from:');		
	// 	},

	// 	defaults: {
	// 		"CUSTNO":200343,
	// 		"COMPANY":"W.O.M INC. JUST GRILLIN",
	// 		"ADDR1":"HOLETOWN ",
	// 		"ADDR2":"",
	// 		"CITY":"",
	// 		"STATE":"ST JAMES",
	// 		"COUNTRY":"",
	// 		"PHONE":"",
	// 		"FAX":"",
	// 		"CONTACT":"",
	// 		"LASTINVOICEDATE":"1/15/2014",
	// 		"ROUTENO":"ROUTE2",
	// 		"CUSTYPE":"M"
	//     }
	// });

	// RCMS.Collections.CustomerCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.CustomerModel		
	// });


	// RCMS.Models.OrderModel = Backbone.Model.extend({		

	// 	initialize: function(){	
	// 		console.log('getting data from:');		
	// 	},

	// 	defaults: {
	// 		"ORDERNO":567492,
	// 		"CUSTNO":100036,
	// 		"SALEDATE":"12/20/2014",
	// 		"SHIPDATE":"12/20/2014",
	// 		"TERMS":"",
	// 		"TOTALITEMS":741.46,
	// 		"STANDING_DAY":"TUE",
	// 		"ROUTENO":"ROUTE3",
	// 		"TOTALVAT":28.04,
	// 		"TOTALDISCOUNT":0	
	//     }
	// });	

	// RCMS.Collections.OrderCollection = Backbone.Collection.extend({
	// 	model 	: RCMS.Models.OrderModel		
	// });


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
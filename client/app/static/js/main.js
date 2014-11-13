
(function (document, window, $, Backbone, _){
	//still have alot to do

	RCMS.Routers.AppRouter = Backbone.Router.extend({

		routes: {
			"" 					: "home",
			"configurations"	: "configurations",			
			"profile" 			: "profile",
			"usage"				: "usage",
			"register"			: "register"
		},

		initialize : function(){
			console.log("initialize");	
			this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
			$("#rcms-body").html(this.authen.el);	
		},

		home : function(){	

			console.log('home');
		},

		configurations: function(){	

			console.log('configurations');
		},

		profile : function(){			
			console.log('profile');
		},

		usage : function(){
			console.log('usage');
		},

		register : function(){
			console.log('register');
		}

	});

	RCMS.templateLoader.load(["Login"],function () {      
		$(document).ready(function(){
			app = new RCMS.Routers.AppRouter();
			Backbone.history.start();
		});
	});


}(document, this, jQuery, Backbone, _));
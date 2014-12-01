
(function (document, window, $, Backbone, _){
	

	RCMS.Routers.AppRouter = Backbone.Router.extend({

		routes: {
			"" 					: "applications",			
			"package"			: "package",
			"register"			: "register",
			"app/stats/:id"		: "app_page",
			"app/settings/:id"	: "app_settings"
		},

		initialize : function(){
			console.log("initialize");	
			this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
		
			$("#content").html(this.authen.el);			
		},

		applications : function(){	

			if($.jStorage.get('apiKey')){	
				
				this.home = new RCMS.Views.Home();				
				$("#content").html(this.home.el);
				this.authen.selectMenuItem('applications');				

			}else{

				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#content").html(this.authen.el);
			}
		},

		register : function(){
			if($.jStorage.get('apiKey')){
				window.location.hash = "";				
			}else{
				this.register = new RCMS.Views.Register({model:new RCMS.Models.Register()});
				$("#content").html(this.register.el);	
			}	
		},

		package : function(){			
			if($.jStorage.get('apiKey')){				
				this.authen.selectMenuItem('package');
				console.log('package');				
			}else{
				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#content").html(this.authen.el);
			}
		},

		app_page : function(id){
			if($.jStorage.get('apiKey')){	
				this.app = new RCMS.Views.App({model:{"id":id}});				
				$("#content").html(this.app.el);

				this.authen.selectMenuItem('stats');
				// console.log('package');				
			}else{
				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#content").html(this.authen.el);
			}
		},

		app_settings : function(id){
			if($.jStorage.get('apiKey')){	
				this.settings = new RCMS.Views.Settings({model:{"id":id}});				
				$("#content").html(this.settings.el);

				this.authen.selectMenuItem('settings');
					
			}else{
				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#content").html(this.authen.el);
			}
		}

	});

	RCMS.templateLoader.load(["Login", "Register", "Home", "AppRow", "App", "Settings"],function () {      
		$(document).ready(function(){
			app = new RCMS.Routers.AppRouter();
			Backbone.history.start();
		});
	});


}(document, this, jQuery, Backbone, _));

(function (document, window, $, Backbone, _){
	

	RCMS.Routers.AppRouter = Backbone.Router.extend({

		routes: {
			"" 			: "applications",			
			"package"	: "package",
			"register"	: "register"
		},

		initialize : function(){
			console.log("initialize");	
			this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
			if($.jStorage.get('apiKey')){

				window.location.hash = "";

			}else{
				$("#content").html(this.authen.el);	
			}				
		},

		applications : function(){	

			if($.jStorage.get('apiKey')){	
				
				this.home = new RCMS.Views.Home();				
				$("#content").html(this.home.el);
				this.authen.selectMenuItem('applications');
				// this.defaultPackage = new RCMS.Models.PackagesModel();
				// this.defaultPackage.url = '/get/user/package/'+ $.jStorage.get('package');

				// this.defaultPackage.fetch({
				// 	success : function(model, response){																											
				// 		$.each(response.package, function(i, data){
				// 			this.home = new RCMS.Views.Home({model:data});
				// 			$("#rcms-body").html(this.home.el);	
				// 		});						
				// 	},
				// 	error : function(model, response){
				// 		console.log(response);				
				// 	}
				// });
				

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
				$("#rcms-body").html(this.authen.el);
			}
		}

	});

	RCMS.templateLoader.load(["Login", "Register", "Home", "Package", "AppRow"],function () {      
		$(document).ready(function(){
			app = new RCMS.Routers.AppRouter();
			Backbone.history.start();
		});
	});


}(document, this, jQuery, Backbone, _));
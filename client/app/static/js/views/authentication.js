

(function (document, window, $, Backbone, _){


	RCMS.Views.AuthenticationView = Backbone.View.extend({

		initialize: function(){	
			this.model.bind('change:loggedIn', this.render, this);		
			this.render();
		},							

		render: function(){

			if (this.model.get('loggedIn')) {
				$("#logout_action").html(new RCMS.Views.Logout({model:this.model}).el);	            	            
				console.log("logged in");
	        } else {
	            this.$el.html(new RCMS.Views.Login().el);	
	            $("#logout_action").html('');            
	        }
	        return this;	        
		},

		events : {
			'submit #login' : 'authen'
		},

		authen : function(){	
			var that = this;
			
			this.hide();
			this.model.url = "/user/login";

			this.model.save(this.getFormData(),{
				success:function(model, response){
					var user = JSON.parse(response.user);					
					that.model.setApiKey(user.PartitionKey+"_"+user.RowKey);
					that.model.setUser(user);
					that.show();					
					window.location.reload();
				},
				error : function(model, response){
					console.log(response);
					that.show();
				}
			});
			$('input[type=text],input[type=password]').val('');
			return false;
		},		

		getFormData : function(){			
			var data = {},
			form = this.$el.find("#login"),

			viewArr = form.serializeArray();			
			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
			});			
			return data;
		},

		hide : function(){
			$("#rcms-body").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#rcms-body").show();
			$("#loading").hide();			
		},

		selectMenuItem: function (menuItem) {
	        $('.nav li').removeClass('active');
	        if (menuItem) {
	            $('.' + menuItem).addClass('active');
	        }
	    }
	});


	RCMS.Views.Login = Backbone.View.extend({

		className : 'row',

		initialize: function(){			
			this.render();
		},		
		
		render: function(){							 
			$(this.el).html(this.template());				
	        return this;
		}
	});


	RCMS.Views.Logout = Backbone.View.extend({

		tagName : 'li',

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html('<a id = "user_logout">Logout</a>');	              
	        return this;
		},

		events:{
			"click #user_logout":  "click"
		},

		click : function(){			
			this.hide();
			this.model.setApiKey(null);				
			window.location.reload();
		},

		hide : function(){
			$("#rcms-body").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#rcms-body").show();
			$("#loading").hide();			
		},
	});


	RCMS.Views.Register = Backbone.View.extend({

		className : 'row',

		initialize: function(){			
			this.render();
		},		
		
		render: function(){							 
			$(this.el).html(this.template());				
	        return this;
		},

		events : {
			'submit #reg' : 'register'
		},

		register : function(){	
			var that = this;
			
			this.hide();			

			this.model.save(this.getFormData(),{
				success:function(model, response){
					console.log(response);
					that.show();					
				},
				error : function(model, response){
					console.log(response);
					that.show();
				}
			});
			$('input[type=text],input[type=password]').val('');
			return false;
		},		

		getFormData : function(){			
			var data = {},
			form = this.$el.find("#reg"),

			viewArr = form.serializeArray();			
			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
			});			
			return data;
		},

		hide : function(){
			$("#rcms-body").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#rcms-body").show();
			$("#loading").hide();			
		}
	});



}(document, this, jQuery, Backbone, _));		
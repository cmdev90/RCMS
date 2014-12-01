(function (document, window, $, Backbone, _){



	RCMS.Views.Home = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			
			this.$el.html(this.template());			
			this.listApps(this.$el.find("#rcms-app-list"));
			this.$el.find("#app-count").html("App Count: "+$.jStorage.get('app_count'));
			return this;
		},

		events : {
			"click .new-app-btn" : "populateLocations",
			"submit #app-form"	: "newApp"
		},

		listApps : function(body){
			var app = new RCMS.Models.ApplicationModel();
			app.url = '/get/user/applications/'+ $.jStorage.get('email');
			console.log(app.url);
			app.fetch({
				success : function(model, response){
					console.log(response);
					$.each(response.applications, function(index, data){
						$(body).append(new RCMS.Views.AppRow({model:data}).el);
					});
				},
				error : function(model, response){
					console.log(response);
				}
			});
		},


		populateLocations : function(e){
			if(parseInt($.jStorage.get('app_count')) >= 5){
				swal("Attention", "By continuing you will agree to pay an additional one time fee for new apps", "warning");
			}
			var locations = new RCMS.Collections.LocationsCollection(),
			that = this,
			list = that.$el.find('#reigon');
			locations.fetch({
				success : function(model, response){																					
					$.each(model.toJSON()[0].locations, function(index,data){
						list.append('<option value = "'+data.name+'">'+data.name+'</option>');
					});			
				},
				error : function(model, response){
					console.log(response);							
				}
			});
			$('#appModal').on('hidden.bs.modal', function (e) {
			  	list.html("");
			});
		},

		newApp : function(){
			var app = new RCMS.Models.ApplicationModel(),
			list = this.$el.find('#reigon'),
			that = this;

			$('#appModal').modal("hide").on('hidden.bs.modal', function (e) {
			  	list.html("");
			  	$('input[type=text],input[type=password]').val('');
			  	that.hide();
			});


			app.save(this.getFormData(),{
				success:function(model, response){
					console.log(response);														
				  	$.jStorage.set('app_count', response.count);					  	
				  	window.location.reload();				
				},
				error : function(model, response){
					that.show();
					console.log(response);								
				}
			});						
			return false;
		},

		getFormData : function(){			
			var data = {
				"partition" : $.jStorage.get("email"),				
			},
			form = this.$el.find("#app-form"),

			viewArr = form.serializeArray();			
			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
			});			
			return data;
		},

		hide : function(){
			$("#content").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#content").show();
			$("#loading").hide();			
		}
	});

	RCMS.Views.AppRow = Backbone.View.extend({

		tagName : "tr",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			return this;
		}

	});


	RCMS.Views.Package = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){		
			$(this.el).html(this.template());	

			var collection = new RCMS.Collections.PackagesCollection(),
			tabBody = this.$el.find("#package-tabs");
			collection.fetch({
				success : function(model, response){
				
					$.each(response.packages, function(index,data){						
						$.each(data, function(i,d){														
							$(tabBody).append(new RCMS.Views.PackageTab({model:data[i]}).el);
						});
					});
				},
				error : function(model, response){
					console.log(response);
				}
			});
			return this;
		}

	});



	RCMS.Views.PackageTab = Backbone.View.extend({

		className : "tab-pane",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			if(this.model.name === "Free"){
				this.$el.addClass('active');
			}
			this.$el.attr('role', "tabpanel");
			this.$el.attr('id',this.model.name);
			return this;
		}

	});
	
}(document, this, jQuery, Backbone, _));			
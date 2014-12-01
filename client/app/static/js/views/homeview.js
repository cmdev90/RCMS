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
			list = this.$el.find('#reigon');

			$('#appModal').modal("hide").on('hidden.bs.modal', function (e) {
			  	list.html("");
			  	$('input[type=text],input[type=password]').val('');
			});


			app.save(this.getFormData(),{
				success:function(model, response){
					console.log(response);														
				  	$.jStorage.set('app_count', response.count);					  	
				  	window.location.reload();				
				},
				error : function(model, response){
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

	
}(document, this, jQuery, Backbone, _));			
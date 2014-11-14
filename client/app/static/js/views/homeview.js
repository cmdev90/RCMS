(function (document, window, $, Backbone, _){

	RCMS.Views.Home = Backbone.View.extend({

		className : "row",

		initialize : function(){
			
			this.render();
		},

		render : function(){

			$(this.el).html(this.template(this.model));				
			this.packages(this.$el.find("#accordion"));
	        return this;
		},

		packages : function(id){
			var pkgCol = new RCMS.Collections.PackagesCollection(),
			that = this;
			that.hide();
			pkgCol.fetch({
				success : function(model, response){																					
					$.each(response.packages, function(index, data){
						$.each(data, function(i,d){							
							$(id).append(new RCMS.Views.Package({model:data[i]}).el);
						});
					});
					that.show();								
				},
				error : function(model, response){
					console.log(response);
					that.show();	
					window.location.reload();				
				}
			});
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


	RCMS.Views.Package = Backbone.View.extend({					

		className : 'panel panel-default',

		initialize: function(){	

			this.render();
		},		
		
		render: function(){				
			$(this.el).html(this.template(this.model));	
	        return this;
		},

		events : {
			'click .pkg-select' : 'setPackage'
		},

		setPackage : function(e){
			this.hide();
			var package = $(e.target).attr('data-name').toLocaleLowerCase(),
			nodes = $(e.target).attr('data-node'),
			data = {},
			that = this,
			pkg = new RCMS.Models.PackagesModel();
			pkg.url = 'http://localhost:5000/update/user/package';

			if (package === $.jStorage.get('package')) {
				this.show();
				window.alert("This is your current package");
			}else{
				data = {
					"username" : $.jStorage.get('username'),
					"password"	: $.jStorage.get('password'),
					"package"	: package,
					"nodes"		: nodes
				};

				pkg.save(data,{
					success:function(model, response){	
						console.log(JSON.stringify(response));	
						$.jStorage.set('package', package);
						that.show();	
						window.location.reload();							
					},
					error : function(model, response){
						console.log(JSON.stringify(response));										
						that.show();
					}
				});
			}
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

var User = Backbone.Model.extend({
  urlRoot: '/user',
  defaults: {
      // do not specify id here, since that
      // will cause troubles with new model creation
      // [ backbone sends a PUT instead of POST ]
   name: "",
   email: ""
  },
  initialize: function() {
      this.bind("change", this.update);
  },
  update: function(event) {
      console.log('update event fired', event);
      if (this.hasChanged('email'))
          this.save();
  }
});

var Users = Backbone.Collection.extend({
  url: '/users',
  model: User,
  initialize: function() {
    //  this.on("add", this.addModel, this);
    console.log('initialized collection');
  },
  render: function(model, collection, options) {
      console.log('collection noticed model removed', model.toJSON());
      this.remove(model);
  },
  addModel: function(model, collection, options) {
    console.log('adding model to collection', model);
    this.add(model);
  }
});

var UserView = Backbone.View.extend({
    tagName: 'li',
    className: 'user',
    initialize: function() {
        this.listenTo(this.model, 'destroy', this.remove);
        this.render();
    },
    render: function() {
        var name = this.model.get('name'),
            email = this.model.get('email'),
            id = this.model.get('id');
        this.$el.append('<span style="display: table-cell;">'+id+'</span>');
        this.$el.append('<a class="name" href="#user/' + id + '">' + name + '</span>');
        this.$el.append('<span class="email" contenteditable="true">'+this.model.get('email')+'</span>');
        this.$el.append('<span class="delete">&#215;</span>');
   },
   events: {
        'click .email': 'editUser',
        'click .delete': 'deleteUser'
   },
   editUser: function() {
       var self = this;
        this.$el.on('blur', '[contenteditable]', function() {
              var _email = $(this).text().trim();
              self.model.set('email', _email);
              console.log('changed email to', _email);
            });
   },
   deleteUser: function() {
       this.model.destroy();
   }
});

var AppView = Backbone.View.extend({
    tagName: 'ul',
    className: 'users',
    initialize: function() {
//        this.collection.bind('remove', this.render, this);
//        this.collection.bind('add', this.render, this);
        this.listenTo(this.collection, 'add', this.addUser);
        this.render();
    },
    addUser: function(model) {
      var userview = new UserView({model: model});
      this.$el.append(userview.el);
    },
    render: function() {
        var user;
        this.collection.forEach(function(model) {
            user = new UserView({model: model});
            this.$el.append(user.el);
            }, this);
    }
});

var AppRouter = Backbone.Router.extend({
    routes: {
        "user/:id": "showUser",
        "*path": "index"
    }
});
var users = new Users();

$(document).ready(function() {
    var app_router = new AppRouter;
    app_router.on('route:showUser', function(id) {
        var _model = new User({id:parseInt(id)});
        _model.fetch({
            success: function() {
                console.log('route', _model.toJSON());
                var user = new UserView({model: _model,
                                         tagName: 'div',
                                         className: 'editor'
                                        });
                console.log('markup', user.el);
                $('body').html(user.el);
            },
            // slient: true to avoid unnecessary change event on fetch
            silent: true
        });
    });
    app_router.on('route:index', function() {
            users.fetch({
                success: function() {
                    var restApp = new AppView({collection: users});
                    console.log('Appending to main body');
                    $('body').html(restApp.$el);
                    $('body').append('<span class="adduser">+</span>');
                    $('span.adduser').css('left', $('ul.users').scrollLeft() +
                                                  $('ul.users').width() + 100);
                    $('span.adduser').css('top', parseInt($(window).height()/2));
                    $('body').on('click', 'span.adduser', function(e) {
                          e.stopPropagation();
                          var name_ = prompt('Enter name')
                          var email = prompt('Enter email')
                          users.create({name: name_, email: email}, {wait: true});
                    });
                 }
            });
        });
    Backbone.history.start();
});

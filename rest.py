
from flask import Flask, request, jsonify, make_response
from flask.ext.sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
# app.config['SQLALCHEMY_ECHO'] = True
app.secret_key = "change-this-on-production"

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32))
    email = db.Column(db.String(120), unique=True)

    def __repr__(self):
        return '<User({0})>'.format(self.email)

    def to_json(self):
        return {'id': self.id,
                'name': self.name,
                'email': self.email
                }


@app.route("/")
def index():
    return file('rest.html').read()


@app.route("/users")
def allusers():
    # x = request.args.get("x")
    # y = request.args.get("y")
    # TODO: error handling
    # z = int(x) + int(y)
#    resp = []
#    for user in User.query.all():
    resp = make_response(json.dumps([{'id': user.id, 'name': user.name, 'email': user.email}
                                     for user in User.query.order_by('id').all()]))
#    print resp
    resp.headers['Content-Type'] = 'application/json'

    # return jsonify({'users': resp})
    return resp
    # return render_template("adder_result.html",
                          # x=x, y=y, z=z)


@app.route("/user/<int:id>")
def user(id):
    u = User.query.get_or_404(id)
    response = make_response(
        json.dumps({'id': u.id, 'name': u.name, 'email': u.email}))
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route("/user/<int:id>", methods=["DELETE"])
def delete_user(id):
    user = User.query.get(id)
    db.session.delete(user)
    db.session.commit()
    response = make_response()
    response.status = "Deleted"
    response.status_code = 204
    return response


@app.route("/user", methods=["POST"])
def add_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    user = User(name=name, email=email)
    db.session.add(user)
    try:
      db.session.commit()
    except Exception, e:
      response = make_response()
      response.status = str(e)
      response.status_code = 400
    else:
      response = make_response(json.dumps(user.to_json()))
    response.headers['Content-Type'] = 'application/json'
    return response


@app.route("/user/<int:id>", methods=["PUT"])
def update_user(id):
    # response = make_response(json.dumps(request.form))
    data = request.get_json()
    response = make_response(json.dumps(data))
    name = data.get('name')
    email = data.get('email')
    _user = User.query.get(id)
    _user.name = name
    _user.email = email
    db.session.commit()
    response.headers['Content-Type'] = 'application/json'
    return response

if __name__ == "__main__":
    app.debug = True
    app.run()

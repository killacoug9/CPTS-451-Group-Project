from app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    pwd = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    role = db.relationship('Role', back_populates='users')
    reservations = db.relationship('Reservation', back_populates='user', lazy='dynamic')
    usage_logs = db.relationship('UsageLog', back_populates='user', lazy='dynamic')
    notifications = db.relationship('Notification', back_populates='user', lazy='dynamic')

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String, nullable=False, unique=True)

    users = db.relationship('User', back_populates='role', lazy='dynamic')

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'))
    res_start_date = db.Column(db.TIMESTAMP, nullable=False)
    res_end_date = db.Column(db.TIMESTAMP, nullable=False)
    reserved_quantity = db.Column(db.Integer, nullable=False)
    reservation_status = db.Column(db.String, nullable=False)
    res_request_date = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    user = db.relationship('User', back_populates='reservations')
    equipment = db.relationship('Equipment', back_populates='reservations')
    reservation_admins = db.relationship('ReservationAdmin', back_populates='reservation', lazy='dynamic')


class Equipment(db.Model):
    __tablename__ = 'equipment'
    id = db.Column(db.Integer, primary_key=True)
    equip_name = db.Column(db.String, nullable=False)
    category = db.Column(db.String, nullable=False)
    specifications = db.Column(db.Text)
    total_quantity = db.Column(db.Integer, nullable=False)
    equip_status = db.Column(db.String, nullable=False)

    reservations = db.relationship('Reservation', back_populates='equipment', lazy='dynamic')
    supplied_items = db.relationship('Supplied', back_populates='equipment', lazy='dynamic')
    usage_logs = db.relationship('UsageLog', back_populates='equipment', lazy='dynamic')


class Supplied(db.Model):
    __tablename__ = 'supplied'
    id = db.Column(db.Integer, primary_key=True)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    date_supplied = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())
    quantity = db.Column(db.Integer, nullable=False)

    equipment = db.relationship('Equipment', back_populates='supplied_items')
    supplier = db.relationship('Supplier', back_populates='supplied_items')


class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    supplier_name = db.Column(db.String, nullable=False)

    supplied_items = db.relationship('Supplied', back_populates='supplier')


class UsageLog(db.Model):
    __tablename__ = 'usage_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'))
    usage_date = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    user = db.relationship('User', back_populates='usage_logs')
    equipment = db.relationship('Equipment', back_populates='usage_logs')

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    notification_message = db.Column(db.String(255), nullable=False)
    notification_timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', back_populates='notifications')


class ReservationAdmin(db.Model):
    __tablename__ = "reservations_admins"
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey("reservations.id"), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("admins.user_id"), nullable=False)

    # Relationship with Admin
    admin = db.relationship('Admin', back_populates='reservation_admins')

    # Relationship with Reservation (Lazy loading enabled)
    reservation = db.relationship('Reservation', back_populates='reservation_admins')


class Admin(db.Model):
    __tablename__ = "admins"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)

    reservation_admins = db.relationship('ReservationAdmin', back_populates='admin', lazy='dynamic')
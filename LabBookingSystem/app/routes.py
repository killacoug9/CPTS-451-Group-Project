from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Role, Reservation, Equipment, Supplied, Notification, Supplier, ReservationAdmin, UsageLog, \
    Admin

main = Blueprint("main", __name__)
api = Blueprint("api", __name__, url_prefix='/api')

@main.route("/")
def home():
    return jsonify({"message": "Lab Booking System API is running!"})

# Create User
@api.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    try:
        user = User(user_name=data['user_name'], email=data['email'], pwd=data['pwd'], role_id=data['role_id'])
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created successfully", "user": {'id': user.id, 'user_name': user.user_name, 'email': user.email}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all Users
@api.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'user_name': user.user_name, 'email': user.email} for user in users])

# Get a specific User by ID
@api.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get(id)
    if user:
        return jsonify({'id': user.id, 'user_name': user.user_name, 'email': user.email})
    return jsonify({"message": "User not found"}), 404

# Update User
@api.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    user = User.query.get(id)
    if user:
        user.user_name = data.get('user_name', user.user_name)
        user.email = data.get('email', user.email)
        db.session.commit()
        return jsonify({"message": "User updated successfully"})
    return jsonify({"message": "User not found"}), 404

# Delete User
@api.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get(id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"})
    return jsonify({"message": "User not found"}), 404

# Create Equipment
@api.route('/equipment', methods=['POST'])
def create_equipment():
    data = request.get_json()
    try:
        equipment = Equipment(equip_name=data['equip_name'], category=data['category'], total_quantity=data['total_quantity'], equip_status=data['equip_status'], specifications=data['specifications'])
        db.session.add(equipment)
        db.session.commit()
        return jsonify({"message": "Equipment created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all Equipment
@api.route('/equipment', methods=['GET'])
def get_equipment():
    equipment = Equipment.query.all()
    return jsonify([{'id': equip.id, 'equip_name': equip.equip_name, 'category': equip.category, 'total_quantity': equip.total_quantity, 'equip_status': equip.equip_status} for equip in equipment])

# Get a specific Equipment by ID
@api.route('/equipment/<int:id>', methods=['GET'])
def get_equipment_by_id(id):
    equip = Equipment.query.get(id)
    if equip:
        return jsonify({'id': equip.id, 'equip_name': equip.equip_name, 'category': equip.category, 'total_quantity': equip.total_quantity, 'equip_status': equip.equip_status})
    return jsonify({"message": "Equipment not found"}), 404

# Update Equipment
@api.route('/equipment/<int:id>', methods=['PUT'])
def update_equipment(id):
    data = request.get_json()
    equipment = Equipment.query.get(id)
    if equipment:
        equipment.equip_name = data.get('equip_name', equipment.equip_name)
        equipment.equip_status = data.get('equip_status', equipment.equip_status)
        equipment.specifications = data.get('specifications', equipment.specifications)
        equipment.total_quantity = data.get('total_quantity', equipment.total_quantity)
        equipment.category = data.get('category', equipment.category)
        db.session.commit()
        return jsonify({"message": "User updated successfully"})
    return jsonify({"message": "User not found"}), 404

# Delete Equipment
@api.route('/equipment/<int:id>', methods=['DELETE'])
def delete_equipment(id):
    equipment = Equipment.query.get(id)
    if equipment:
        db.session.delete(equipment)
        db.session.commit()
        return jsonify({"message": "Equipment deleted successfully"})
    return jsonify({"message": "Equipment not found"}), 404


# Create Reservation
@api.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    try:
        reservation = Reservation(user_id=data['user_id'], equipment_id=data['equipment_id'], res_start_date=data['res_start_date'], res_end_date=data['res_end_date'], reserved_quantity=data['reserved_quantity'], reservation_status=data['reservation_status'])
        db.session.add(reservation)
        db.session.commit()
        return jsonify({"message": "Reservation created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all Reservations
@api.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([{'id': res.id, 'user_id': res.user_id, 'equipment_id': res.equipment_id, 'res_start_date': res.res_start_date, 'res_end_date': res.res_end_date, 'reserved_quantity': res.reserved_quantity, 'reservation_status': res.reservation_status} for res in reservations])

# Get a specific Reservation by ID
@api.route('/reservations/<int:id>', methods=['GET'])
def get_reservation(id):
    reservation = Reservation.query.get(id)
    if reservation:
        return jsonify({'id': reservation.id, 'user_id': reservation.user_id, 'equipment_id': reservation.equipment_id, 'res_start_date': reservation.res_start_date, 'res_end_date': reservation.res_end_date, 'reserved_quantity': reservation.reserved_quantity, 'reservation_status': reservation.reservation_status})
    return jsonify({"message": "Reservation not found"}), 404

#Update Reservation
@api.route('/reservations/<int:id>', methods=['PUT'])
def update_reservation(id):
    data = request.get_json()
    reservation = Reservation.query.get(id)
    if reservation:
        reservation.user_id = data.get('user_id', reservation.user_id)
        reservation.equipment_id = data.get('equipment_id', reservation.equipment_id)
        reservation.res_start_date = data.get('res_start_date', reservation.res_start_date)
        reservation.res_end_date = data.get('res_end_date', reservation.res_end_date)
        reservation.reserved_quantity = data.get('reserved_quantity', reservation.reserved_quantity)
        reservation.reservation_status = data.get('reservation_status', reservation.reservation_status)
        db.session.commit()
        return jsonify({"message": "Reservation updated successfully"})
    return jsonify({"message": "Reservation not found"}), 404

# Delete Reservation
@api.route('/reservations/<int:id>', methods=['DELETE'])
def delete_reservation(id):
    reservation = Reservation.query.get(id)
    if reservation:
        db.session.delete(reservation)
        db.session.commit()
        return jsonify({"message": "Reservation deleted successfully"})
    return jsonify({"message": "Reservation not found"}), 404


@api.route('/roles', methods=['POST'])
def create_role():
    data = request.get_json()
    role = Role(role_name=data['role_name'])
    db.session.add(role)
    db.session.commit()
    return jsonify({"message": "Role created successfully"}), 201

@api.route('/roles', methods=['GET'])
def get_roles():
    roles = Role.query.all()
    return jsonify([{'id': r.id, 'role_name': r.role_name} for r in roles])

@api.route('/roles/<int:id>', methods=['DELETE'])
def delete_role(id):
    role = Role.query.get(id)
    if role:
        db.session.delete(role)
        db.session.commit()
        return jsonify({"message": "Role deleted successfully"})
    return jsonify({"message": "Role not found"}), 404


@api.route('/notifications', methods=['GET'])
def get_notifications():
    notifications = Notification.query.all()
    return jsonify([{'id': n.id, 'user_id': n.user_id, 'message': n.notification_message} for n in notifications])

@api.route('/notifications', methods=['POST'])
def create_notification():
    data = request.get_json()
    notification = Notification(user_id=data['user_id'], notification_message=data['message'])
    db.session.add(notification)
    db.session.commit()
    return jsonify({"message": "Notification created successfully"}), 201

@api.route('/notifications/<int:id>', methods=['DELETE'])
def delete_notification(id):
    notification = Notification.query.get(id)
    if notification:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"})
    return jsonify({"message": "Notification not found"}), 404


@api.route('/reservations_admins', methods=['POST'])
def create_reservation_admin():
    data = request.get_json()
    reservation_admin = ReservationAdmin(reservation_id=data['reservation_id'], admin_id=data['admin_id'])
    db.session.add(reservation_admin)
    db.session.commit()
    return jsonify({"message": "ReservationAdmin entry created successfully"}), 201

@api.route('/reservations_admins', methods=['GET'])
def get_reservations_admins():
    records = ReservationAdmin.query.all()
    return jsonify([{'id': r.id, 'reservation_id': r.reservation_id, 'admin_id': r.admin_id} for r in records])

@api.route('/reservations_admins/<int:id>', methods=['DELETE'])
def delete_reservation_admin(id):
    record = ReservationAdmin.query.get(id)
    if record:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"message": "Entry deleted successfully"})
    return jsonify({"message": "Entry not found"}), 404


@api.route('/supplied', methods=['POST'])
def create_supplied():
    data = request.get_json()
    supplied = Supplied(supplier_id=data['supplier_id'], equipment_id=data['equipment_id'], quantity=data['quantity'])
    db.session.add(supplied)
    db.session.commit()
    return jsonify({"message": "Supplied record created successfully"}), 201

@api.route('/supplied', methods=['GET'])
def get_supplied():
    supplied_records = Supplied.query.all()
    return jsonify([{'id': s.id, 'supplier_id': s.supplier_id, 'equipment_id': s.equipment_id, 'quantity': s.quantity} for s in supplied_records])

@api.route('/supplied/<int:id>', methods=['PUT'])
def update_supplied(id):
    data = request.get_json()
    supplied = Supplied.query.get(id)
    if supplied:
        supplied.supplier_id = data.get('supplier_id', supplied.supplier_id)
        supplied.equipment_id = data.get('equipment_id', supplied.equipment_id)
        supplied.supplied_quantity = data.get('quantity', supplied.quantity)
        db.session.commit()
        return jsonify({"message": "Supplied entry updated successfully"})
    return jsonify({"message": "Supplied entry not found"}), 404

@api.route('/supplied/<int:id>', methods=['DELETE'])
def delete_supplied(id):
    supplied = Supplied.query.get(id)
    if supplied:
        db.session.delete(supplied)
        db.session.commit()
        return jsonify({"message": "Supplied entry deleted successfully"})
    return jsonify({"message": "Supplied entry not found"}), 404


@api.route('/suppliers', methods=['POST'])
def create_supplier():
    data = request.get_json()
    supplier = Supplier(supplier_name=data['supplier_name'], contact_info=data['contact_info'])
    db.session.add(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier created successfully"}), 201

@api.route('/suppliers', methods=['GET'])
def get_suppliers():
    supplier_records = Supplier.query.all()
    return jsonify([{'id': s.id, 'supplier_name': s.supplier_name} for s in supplier_records])

@api.route('/suppliers/<int:id>', methods=['PUT'])
def update_supplier(id):
    data = request.get_json()
    supplier = Supplier.query.get(id)
    if supplier:
        supplier.supplier_name = data.get('supplier_name', supplier.supplier_name)
        supplier.contact_info = data.get('contact_info', supplier.contact_info)
        db.session.commit()
        return jsonify({"message": "Supplier updated successfully"})
    return jsonify({"message": "Supplier not found"}), 404

@api.route('/suppliers/<int:id>', methods=['DELETE'])
def delete_supplier(id):
    supplier = Supplier.query.get(id)
    if supplier:
        db.session.delete(supplier)
        db.session.commit()
        return jsonify({"message": "Supplier deleted successfully"})
    return jsonify({"message": "Supplier not found"}), 404


# Create UsageLog
@api.route('/usage_logs', methods=['POST'])
def create_usage_log():
    data = request.get_json()
    try:
        usage_log = UsageLog(user_id=data['user_id'], equipment_id=data['equipment_id'])
        db.session.add(usage_log)
        db.session.commit()
        return jsonify({"message": "UsageLog created successfully", "usage_log": {'id': usage_log.id, 'user_id': usage_log.user_id, 'equipment_id': usage_log.equipment_id, 'usage_date': usage_log.usage_date}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get all UsageLogs
@api.route('/usage_logs', methods=['GET'])
def get_usage_logs():
    usage_logs = UsageLog.query.all()
    return jsonify([{'id': log.id, 'user_id': log.user_id, 'equipment_id': log.equipment_id, 'usage_date': log.usage_date} for log in usage_logs])

# Get a specific UsageLog by ID
@api.route('/usage_logs/<int:id>', methods=['GET'])
def get_usage_log(id):
    usage_log = UsageLog.query.get(id)
    if usage_log:
        return jsonify({'id': usage_log.id, 'user_id': usage_log.user_id, 'equipment_id': usage_log.equipment_id, 'usage_date': usage_log.usage_date})
    return jsonify({"message": "UsageLog not found"}), 404

# Update UsageLog
@api.route('/usage_logs/<int:id>', methods=['PUT'])
def update_usage_log(id):
    data = request.get_json()
    usage_log = UsageLog.query.get(id)
    if usage_log:
        usage_log.user_id = data.get('user_id', usage_log.user_id)
        usage_log.equipment_id = data.get('equipment_id', usage_log.equipment_id)
        db.session.commit()
        return jsonify({"message": "UsageLog updated successfully"})
    return jsonify({"message": "UsageLog not found"}), 404

# Delete UsageLog
@api.route('/usage_logs/<int:id>', methods=['DELETE'])
def delete_usage_log(id):
    usage_log = UsageLog.query.get(id)
    if usage_log:
        db.session.delete(usage_log)
        db.session.commit()
        return jsonify({"message": "UsageLog deleted successfully"})
    return jsonify({"message": "UsageLog not found"}), 404


#### DO WE NEED OTHER ADMIN FUNCTIONS??
# Get all Admins
@api.route('/admins', methods=['GET'])
def get_admins():
    #if not is_admin():  # Check if the user is an admin
        #return jsonify({"message": "Unauthorized"}), 403

    admins = Admin.query.all()
    return jsonify([{'user_id': admin.user_id} for admin in admins])

### ADD RESERVATIONADMIN CRUD Operations?
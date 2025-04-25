from flask import Blueprint, request, jsonify
from sqlalchemy import and_, func
from datetime import datetime
from app import db
from app.models import User, Role, Reservation, Equipment, Supplied, Notification, Supplier, ReservationAdmin, UsageLog, \
    Admin

main = Blueprint("main", __name__)
api = Blueprint("api", __name__, url_prefix='/api')

EQUIPMENT_AVAILABLE_STATUS = 'available'
RESERVATION_PENDING_STATUS = 'pending'
RESERVATION_APPROVED_STATUS = 'approved'
RESERVATION_REJECTED_STATUS = 'denied'
RESERVATION_CANCELLED_STATUS = 'cancelled'
RESERVATION_FULL_STATUS = 'in_use'


@main.route("/")
def home():
    return jsonify({"message": "Lab Booking System API is running!"})


# Check equipment availability for specific dates
@api.route('/equipment/availability', methods=['POST'])
def check_equipment_availability():
    data = request.get_json()

    # Required parameters
    equipment_id = data.get('equipment_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    requested_quantity = data.get('quantity', 1)

    # Convert string dates to datetime objects
    try:
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Get the equipment
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return jsonify({"error": "Equipment not found"}), 404

    # Check if the equipment is available
    if equipment.equip_status != EQUIPMENT_AVAILABLE_STATUS:
        return jsonify({
            "available": False,
            "message": f"Equipment is {equipment.equip_status}",
            "available_quantity": 0
        }), 200

    # Calculate how many units are already reserved for the requested dates
    reserved_quantity = db.session.query(
        func.sum(Reservation.reserved_quantity)
    ).filter(
        Reservation.equipment_id == equipment_id,
        Reservation.reservation_status.in_([RESERVATION_PENDING_STATUS, RESERVATION_APPROVED_STATUS]),
        and_(
            Reservation.res_start_date <= end_date,
            Reservation.res_end_date >= start_date
        )
    ).scalar() or 0

    # Calculate available quantity
    available_quantity = equipment.total_quantity - reserved_quantity

    # Check if the requested quantity is available
    if available_quantity < requested_quantity:
        return jsonify({
            "available": False,
            "message": f"Only {available_quantity} units available for the selected dates",
            "available_quantity": available_quantity
        }), 200

    return jsonify({
        "available": True,
        "message": "Equipment is available for the selected dates",
        "available_quantity": available_quantity
    }), 200


# Enhanced reservation creation endpoint
@api.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()

    try:
        # Check if requested quantity is available
        equipment_id = data.get('equipment_id')
        start_date = data.get('res_start_date')
        end_date = data.get('res_end_date')
        requested_quantity = data.get('reserved_quantity', 1)

        # Convert string dates to datetime objects if they are strings
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        # Get the equipment
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({"error": "Equipment not found"}), 404

        # Check equipment status
        if equipment.equip_status != EQUIPMENT_AVAILABLE_STATUS:
            return jsonify({"error": f"Equipment is {equipment.equip_status}"}), 400

        # Calculate how many units are already reserved for the requested dates
        reserved_quantity = db.session.query(
            func.sum(Reservation.reserved_quantity)
        ).filter(
            Reservation.equipment_id == equipment_id,
            Reservation.reservation_status.in_([RESERVATION_PENDING_STATUS, RESERVATION_APPROVED_STATUS]),
            and_(
                Reservation.res_start_date <= end_date,
                Reservation.res_end_date >= start_date
            )
        ).scalar() or 0

        # Calculate available quantity
        available_quantity = equipment.total_quantity - reserved_quantity

        # Check if the requested quantity is available
        if available_quantity < requested_quantity:
            return jsonify({
                "error": f"Only {available_quantity} units available for the selected dates"
            }), 400

        # Create the reservation
        reservation = Reservation(
            user_id=data['user_id'],
            equipment_id=data['equipment_id'],
            res_start_date=start_date,
            res_end_date=end_date,
            reserved_quantity=requested_quantity,
            reservation_status=RESERVATION_PENDING_STATUS  # Initial status
        )

        db.session.add(reservation)

        # Update equipment status if all units are now reserved
        remaining_quantity = equipment.total_quantity - (reserved_quantity + requested_quantity)
        if remaining_quantity <= 0:
            equipment.equip_status = RESERVATION_FULL_STATUS

        # Create a notification for the user
        notification = Notification(
            user_id=data['user_id'],
            notification_message=f"Your reservation (ID: {reservation.id}) for {equipment.equip_name} has been submitted and is pending approval."
        )
        db.session.add(notification)

        db.session.commit()

        return jsonify({
            "message": "Reservation created successfully",
            "reservation": {
                'id': reservation.id,
                'user_id': reservation.user_id,
                'equipment_id': reservation.equipment_id,
                'res_start_date': reservation.res_start_date.isoformat(),
                'res_end_date': reservation.res_end_date.isoformat(),
                'reserved_quantity': reservation.reserved_quantity,
                'reservation_status': reservation.reservation_status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Endpoint to approve or reject reservations (for admins)
@api.route('/reservations/<int:id>/status', methods=['PUT'])
def update_reservation_status(id):
    data = request.get_json()
    new_status = data.get('status')
    admin_id = data.get('admin_id')

    if not new_status or not admin_id:
        return jsonify({"error": "Status and admin_id are required"}), 400

    # Ensure status is lowercase to match constraint
    new_status = new_status.lower()

    if new_status not in [RESERVATION_APPROVED_STATUS, RESERVATION_REJECTED_STATUS, RESERVATION_CANCELLED_STATUS]:
        return jsonify({"error": f"Invalid status '{new_status}'"}), 400

    reservation = Reservation.query.get(id)
    if not reservation:
        return jsonify({"message": "Reservation not found"}), 404

    # Check if admin exists
    admin = Admin.query.filter_by(user_id=admin_id).first()
    user = User.query.get(admin_id)

    is_admin = admin is not None or (user and user.role_id == 1)
    if not is_admin:
        return jsonify({"error": "Admin not found"}), 404

    try:
        # Update reservation status
        reservation.reservation_status = new_status

        # Create admin-reservation association
        reservation_admin = ReservationAdmin(
            reservation_id=reservation.id,
            admin_id=admin_id
        )
        db.session.add(reservation_admin)

        # Create a notification for the user
        equipment = Equipment.query.get(reservation.equipment_id)
        notification = Notification(
            user_id=reservation.user_id,
            notification_message=f"Your reservation (ID: {reservation.id}) for {equipment.equip_name} has been {new_status.lower()}."
        )
        db.session.add(notification)

        # Update equipment status if needed
        if new_status == RESERVATION_APPROVED_STATUS:
            # If all equipment units are now booked, update status
            check_equipment_fully_booked(reservation.equipment_id)
        elif new_status in [RESERVATION_REJECTED_STATUS, RESERVATION_CANCELLED_STATUS]:
            # Update equipment status if it was fully booked
            equipment = Equipment.query.get(reservation.equipment_id)
            if equipment.equip_status == RESERVATION_FULL_STATUS:
                equipment.equip_status = EQUIPMENT_AVAILABLE_STATUS

        db.session.commit()

        return jsonify({"message": f"Reservation {new_status.lower()} successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Helper function to check if equipment is fully booked
def check_equipment_fully_booked(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return

    # Get the total reserved quantity
    total_reserved = db.session.query(
        func.sum(Reservation.reserved_quantity)
    ).filter(
        Reservation.equipment_id == equipment_id,
        Reservation.reservation_status == RESERVATION_APPROVED_STATUS
    ).scalar() or 0

    # Update equipment status based on availability
    if total_reserved >= equipment.total_quantity:
        equipment.equip_status = RESERVATION_FULL_STATUS
    else:
        equipment.equip_status = EQUIPMENT_AVAILABLE_STATUS

###########
###CRUD ROUTES BELOW
##########

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


@api.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    user = User.query.get(id)
    if user:
        user.user_name = data.get('user_name', user.user_name)
        user.email = data.get('email', user.email)

        if 'role_id' in data and data['role_id'] != user.role_id:
            old_role_id = user.role_id
            user.role_id = data['role_id']

            # If changing to admin role, add to Admin table
            if data['role_id'] == 1:
                admin = Admin.query.filter_by(user_id=id).first()
                if not admin:
                    admin = Admin(user_id=id)
                    db.session.add(admin)

            # If changing from admin role, remove from Admin table
            elif old_role_id == 1:
                admin = Admin.query.filter_by(user_id=id).first()
                if admin:
                    db.session.delete(admin)

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


# # Create Reservation
# @api.route('/reservations', methods=['POST'])
# def create_reservation():
#     data = request.get_json()
#     try:
#         reservation = Reservation(user_id=data['user_id'], equipment_id=data['equipment_id'], res_start_date=data['res_start_date'], res_end_date=data['res_end_date'], reserved_quantity=data['reserved_quantity'], reservation_status=data['reservation_status'])
#         db.session.add(reservation)
#         db.session.commit()
#         return jsonify({"message": "Reservation created successfully"}), 201
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 400

# Get all Reservations
@api.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([
        {
            'id': res.id,
            'user_id': res.user_id,
            'equipment_id': res.equipment_id,
            'res_start_date': res.res_start_date.isoformat() if res.res_start_date else None,
            'res_end_date': res.res_end_date.isoformat() if res.res_end_date else None,
            'res_request_date': res.res_request_date.isoformat() if res.res_request_date else None,
            'reserved_quantity': res.reserved_quantity,
            'reservation_status': res.reservation_status
        }
        for res in reservations
    ])

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

# Get a specific role by ID
@api.route('/roles/<int:id>', methods=['GET'])
def get_role(id):
    role = Role.query.get(id)
    if role:
        return jsonify({'id': role.id, 'role_name': role.role_name})
    return jsonify({"message": "Role not found"}), 404


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


# Sync Admin table with users that have role_id=1
@api.route('/admin/sync', methods=['POST'])
def sync_admin_table():
    try:
        # Get all users with role_id=1
        admin_users = User.query.filter_by(role_id=1).all()

        # Add each to Admin table if not already there
        count = 0
        for user in admin_users:
            admin = Admin.query.filter_by(user_id=user.id).first()
            if not admin:
                admin = Admin(user_id=user.id)
                db.session.add(admin)
                count += 1

        db.session.commit()

        return jsonify({
            "message": f"Admin table synchronized. Added {count} new admin entries."
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@api.route('/admin/add/<int:user_id>', methods=['POST'])
def add_user_to_admin(user_id):
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if already in Admin table
        admin = Admin.query.filter_by(user_id=user_id).first()
        if admin:
            return jsonify({"message": "User is already in Admin table"}), 200

        # Add to Admin table
        admin = Admin(user_id=user_id)
        db.session.add(admin)
        db.session.commit()

        return jsonify({"message": f"User {user_id} added to Admin table successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
// app.ts

enum VehicleStatus {
  Available = 'Available',
  InUse = 'InUse',
  Removed = 'Removed'
}

enum VehicleType {
  Bike = 'Bike',
  Scooter = 'Scooter',
  EScooter = 'E-Scooter'
}

let vehicleIdCounter = 1;
let userIdCounter = 1;

const vehicleList: Vehicle[] = [];
const userList: User[] = [];
const cityList: City[] = [];

interface IVehicle {
  id: number;
  type: VehicleType;
  status: VehicleStatus;
  assignedUser: User | undefined;
  assignUser( user: User ): void;
  unassignUser(): void;
}

interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  paymentMethod: string;
  bookedVehicle: Vehicle | undefined;
  bookVehicle( vehicle: Vehicle ): void;
  returnVehicle(): void;
}

interface ICity {
  name: string;
  vehicles: Vehicle[];
  addVehicle( vehicle: Vehicle ): void;
  listVehicles(): void;
}

class Vehicle implements IVehicle {
  id: number;
  type: VehicleType;
  status: VehicleStatus = VehicleStatus.Available;
  assignedUser: User | undefined = undefined;
  constructor ( type: VehicleType ) {
    this.id = vehicleIdCounter++;
    this.type = type;
    vehicleList.push( this );
  }
  assignUser( user: User ): void {
    if ( this.status === VehicleStatus.Available && !this.assignedUser ) {
      this.status = VehicleStatus.InUse;
      this.assignedUser = user;
      user.bookedVehicle = this;
      console.log( `Vehicle ${ this.type } (ID: ${ this.id }) assigned to ${ user.firstName } ${ user.lastName }` );
    } else {
      console.log( `Vehicle ${ this.type } (ID: ${ this.id }) is not available.` );
    }
  }
  unassignUser(): void {
    if ( this.assignedUser ) {
      console.log( `Vehicle ${ this.type } (ID: ${ this.id }) returned by ${ this.assignedUser.firstName } ${ this.assignedUser.lastName }` );
      this.assignedUser.bookedVehicle = undefined;
      this.assignedUser = undefined;
      this.status = VehicleStatus.Available;
    } else {
      console.log( `Vehicle ${ this.type } (ID: ${ this.id }) is not assigned to any user.` );
    }
  }
  static delete( vehicle: Vehicle, city?: City ) {
    if ( !city ) {
      console.log( "City not specified for vehicle removal." );
      return;
    }
    if ( vehicle.status === VehicleStatus.InUse && vehicle.assignedUser ) {
      console.log( `Cannot remove vehicle ${ vehicle.type } (ID: ${ vehicle.id }): it is currently booked by ${ vehicle.assignedUser.firstName } ${ vehicle.assignedUser.lastName }.` );
      return;
    }
    
    const idx = city.vehicles.indexOf( vehicle );
    if ( idx !== -1 ) city.vehicles.splice( idx, 1 );
    vehicle.status = VehicleStatus.Removed;
    console.log( `Vehicle ${ vehicle.type } (ID: ${ vehicle.id }) removed from city ${ city.name } and marked as removed.` );
  }
}

class User implements IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  paymentMethod: string;
  bookedVehicle: Vehicle | undefined = undefined;
  constructor ( firstName: string, lastName: string, email: string, paymentMethod: string ) {
    this.id = userIdCounter++;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.paymentMethod = paymentMethod;
    userList.push( this );
  }
  bookVehicle( vehicle: Vehicle ): void {
    if ( vehicle.status === VehicleStatus.Available && !this.bookedVehicle ) {
      vehicle.assignUser( this );
    } else {
      console.log( `Cannot book vehicle ${ vehicle.type } (ID: ${ vehicle.id }).` );
    }
  }
  returnVehicle(): void {
    if ( this.bookedVehicle ) {
      this.bookedVehicle.unassignUser();
    } else {
      console.log( `${ this.firstName } ${ this.lastName } has no vehicle to return.` );
    }
  }
  static delete( user: User ) {
    const idx = userList.indexOf( user );
    if ( idx !== -1 ) userList.splice( idx, 1 );
    if ( user.bookedVehicle ) user.returnVehicle();
  }
}

class City implements ICity {
  name: string;
  vehicles: Vehicle[] = [];
  constructor ( name: string ) {
    this.name = name;
    cityList.push( this );
  }
  addVehicle( vehicle: Vehicle ): void {
    this.vehicles.push( vehicle );
    console.log( `Vehicle ${ vehicle.type } (ID: ${ vehicle.id }) added to city ${ this.name }` );
  }
  removeVehicle( vehicle: Vehicle ): void {
    const idx = this.vehicles.indexOf( vehicle );
    if ( idx !== -1 ) {
      this.vehicles.splice( idx, 1 );
      console.log( `Vehicle ${ vehicle.type } (ID: ${ vehicle.id }) removed from city ${ this.name }` );
    } else {
      console.log( `Vehicle ${ vehicle.type } (ID: ${ vehicle.id }) not found in city ${ this.name }` );
    }
  }
  listVehicles(): void {
    const activeVehicles = this.vehicles.filter( v => v.status !== VehicleStatus.Removed );
    console.log( `Vehicles in ${ this.name }:`, activeVehicles.map( v => `${ v.type } (ID: ${ v.id }) - ${ v.status }` ) );
  }
}

// --- TEST LOGIC ---
console.log( '--- Moove System Test ---' );

// Create citys
const city1 = new City( 'Gradara' );
const city2 = new City( 'Pesaro' );

// Create vehicles
const bike = new Vehicle( VehicleType.Bike );
const scooter = new Vehicle( VehicleType.Scooter );
const eScooter = new Vehicle( VehicleType.EScooter );

// Create users
const user1 = new User( 'Simone', 'Camerano', 'camerano@example.com', 'Bancomat' );
const user2 = new User( 'Luca', 'Rossi', 'rossi@example.com', 'PayPal' );

// Add vehicles to cities
city1.addVehicle( bike );
city1.addVehicle( scooter );
city2.addVehicle( eScooter );

// List available vehicles
city1.listVehicles();
city2.listVehicles();

// Book vehicles
user1.bookVehicle( bike );
user2.bookVehicle( scooter );
city1.listVehicles();

// Return vehicles
user1.returnVehicle();
city1.listVehicles();

// Test removal of unbooked vehicle
Vehicle.delete( eScooter, city2 );
city2.listVehicles();

// Test removal of booked vehicle
Vehicle.delete( scooter, city1 );
city1.listVehicles();
// Direct removal of a vehicle from the city
city1.removeVehicle( bike );
city1.listVehicles();
console.log("Cities:",cityList.map(city => city.name));
console.log( '--- End of Test ---' );
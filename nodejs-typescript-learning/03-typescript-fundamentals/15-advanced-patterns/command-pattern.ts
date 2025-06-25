/**
 * Command Pattern Implementation
 * 
 * The Command Pattern encapsulates a request as an object, thereby allowing for:
 * - Parameterization of clients with different requests
 * - Queue or log requests
 * - Support undoable operations
 */

// Command interface
export interface Command {
  execute(): void;
  undo(): void;
}

// Receiver: knows how to perform the operations
class Light {
  private isOn: boolean = false;
  private location: string;

  constructor(location: string = '') {
    this.location = location ? `${location} ` : '';
  }

  on(): void { 
    this.isOn = true;
    console.log(`${this.location}Light is on`); 
  }
  
  off(): void { 
    this.isOn = false;
    console.log(`${this.location}Light is off`); 
  }

  getState(): boolean {
    return this.isOn;
  }
}

// Concrete Command
class LightOnCommand implements Command {
  private light: Light;
  private prevState: boolean = false;
  
  constructor(light: Light) {
    this.light = light;
  }
  
  execute(): void { 
    this.prevState = this.light.getState();
    this.light.on(); 
  }
  
  undo(): void { 
    if (!this.prevState) {
      this.light.off();
    } else {
      this.light.on();
    }
  }
}

// Concrete Command
class LightOffCommand implements Command {
  private light: Light;
  private prevState: boolean = false;
  
  constructor(light: Light) {
    this.light = light;
  }
  
  execute(): void { 
    this.prevState = this.light.getState();
    this.light.off(); 
  }
  
  undo(): void { 
    if (this.prevState) {
      this.light.on();
    } else {
      this.light.off();
    }
  }
}

// Invoker: asks the command to carry out the request
class RemoteControl {
  private onCommands: Command[] = [];
  private offCommands: Command[] = [];
  private undoCommand: Command | null = null;
  private readonly slots: number;

  constructor(slots: number = 3) {
    this.slots = slots;
    const noCommand = new NoCommand();
    
    // Initialize all slots with no-ops
    for (let i = 0; i < slots; i++) {
      this.onCommands[i] = noCommand;
      this.offCommands[i] = noCommand;
    }
    this.undoCommand = noCommand;
  }

  setCommand(slot: number, onCommand: Command, offCommand: Command): void {
    if (slot >= 0 && slot < this.slots) {
      this.onCommands[slot] = onCommand;
      this.offCommands[slot] = offCommand;
    } else {
      console.error(`Invalid slot: ${slot}. Must be between 0 and ${this.slots - 1}`);
    }
  }

  onButtonWasPushed(slot: number): void {
    if (slot >= 0 && slot < this.slots) {
      this.onCommands[slot].execute();
      this.undoCommand = this.onCommands[slot];
    }
  }

  offButtonWasPushed(slot: number): void {
    if (slot >= 0 && slot < this.slots) {
      this.offCommands[slot].execute();
      this.undoCommand = this.offCommands[slot];
    }
  }

  undoButtonWasPushed(): void {
    if (this.undoCommand) {
      console.log('--- Undo last command ---');
      this.undoCommand.undo();
      this.undoCommand = null;
    } else {
      console.log('No command to undo');
    }
  }

  toString(): string {
    let stringBuff = ['\n------ Remote Control -------\n'];
    for (let i = 0; i < this.slots; i++) {
      stringBuff.push(`[slot ${i}] ${this.onCommands[i].constructor.name}    ${this.offCommands[i].constructor.name}\n`);
    }
    return stringBuff.join('');
  }
}

// A command that does nothing
class NoCommand implements Command {
  execute(): void {}
  undo(): void {}
}

// Example usage
function demo() {
  // Create the receiver
  const livingRoomLight = new Light('Living Room');
  const kitchenLight = new Light('Kitchen');

  // Create commands
  const livingRoomLightOn = new LightOnCommand(livingRoomLight);
  const livingRoomLightOff = new LightOffCommand(livingRoomLight);
  const kitchenLightOn = new LightOnCommand(kitchenLight);
  const kitchenLightOff = new LightOffCommand(kitchenLight);

  // Create invoker and set commands
  const remote = new RemoteControl(2);
  remote.setCommand(0, livingRoomLightOn, livingRoomLightOff);
  remote.setCommand(1, kitchenLightOn, kitchenLightOff);

  console.log(remote.toString());

  // Test the remote
  console.log('--- Testing Light On ---');
  remote.onButtonWasPushed(0);
  remote.onButtonWasPushed(1);
  
  console.log('\n--- Testing Light Off ---');
  remote.offButtonWasPushed(0);
  remote.offButtonWasPushed(1);
  
  console.log('\n--- Testing Undo ---');
  remote.onButtonWasPushed(0);
  remote.undoButtonWasPushed();
  
  // Test undo after multiple commands
  console.log('\n--- Testing Multiple Commands and Undo ---');
  remote.onButtonWasPushed(0);
  remote.onButtonWasPushed(1);
  remote.undoButtonWasPushed();
}

// Uncomment to run the demo
// demo();

export {
  Command,
  Light,
  LightOnCommand,
  LightOffCommand,
  RemoteControl,
  NoCommand
};

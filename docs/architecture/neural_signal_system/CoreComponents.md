
# Neural Signal System - Core Components

## BrowserSignalEmitter

The BrowserSignalEmitter is the foundation of the neural signal system, providing basic signal emission and subscription capabilities.

**Key Methods:**
- `on(signal, handler)`: Subscribes to a signal
- `off(signal, handler)`: Unsubscribes from a signal
- `emit(signal, payload)`: Emits a signal with payload
- `removeAllListeners()`: Removes all signal listeners

## NeuralBus

The NeuralBus extends BrowserSignalEmitter with system-specific functionality.

**Key Methods:**
- `emitSignal(signal)`: Emits a typed system signal
- `onSignal(signalType, handler)`: Subscribes to a typed system signal

## KernelBridge

The KernelBridge facilitates communication between different kernels using the neural signal system.

**Key Responsibilities:**
- Route signals between kernels
- Transform signals as they pass between kernels
- Maintain kernel connections
- Handle signal propagation errors

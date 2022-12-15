// Class for interfacing with IO Devices on the main thread (window access).

import { IoDevices } from "@wasmer/io-devices";

export default class IoDeviceWindow {
  ioDevices: IoDevices | undefined;

  // Handle Key Press / Release
  oldPopupKeyCodes: Array<number> = [];
  popupKeyCodes: Array<number> = [];

  sharedIoDeviceInput: Int32Array | undefined;

  constructor(sharedIoDeviceInputBuffer?: SharedArrayBuffer) {
    if (sharedIoDeviceInputBuffer) {
      this.sharedIoDeviceInput = new Int32Array(sharedIoDeviceInputBuffer);
    }
  }

  resize(width: number, height: number): void {
    
  }

  close(): void {
   
  }

  drawRgbaArrayToFrameBuffer(rgbaArray: Uint8Array): void {
   
  }

  getInputBuffer(): Uint8Array {
    // Handle keyCodes
    const inputArray: number[] = [];

    // Key Presses
    this.popupKeyCodes.forEach(keyCode => {
      if (!this.oldPopupKeyCodes.includes(keyCode)) {
        inputArray.push(1);
        inputArray.push(keyCode);
      }
    });

    // Key Releases
    this.oldPopupKeyCodes.forEach(keyCode => {
      if (!this.popupKeyCodes.includes(keyCode)) {
        inputArray.push(3);
        inputArray.push(keyCode);
      }
    });
    this.oldPopupKeyCodes = this.popupKeyCodes.slice(0);

    const inputBytes = new Uint8Array(inputArray);

    if (this.sharedIoDeviceInput) {
      // Write the buffer to the memory
      for (let i = 0; i < inputBytes.length; i++) {
        this.sharedIoDeviceInput[i + 1] = inputBytes[i];
      }

      // Write our number of elements
      this.sharedIoDeviceInput[0] = inputBytes.length;

      Atomics.notify(this.sharedIoDeviceInput, 0, 1);
    }

    return inputBytes;
  }

  _open(width: number, height: number): void {

  }

  _append32BitIntToByteArray(value: number, numberArray: number[]) {
    for (let i = 0; i < 4; i++) {
      // Goes smallest to largest (little endian)
      let currentByte = value;
      currentByte = currentByte & (0xff << (i * 8));
      currentByte = currentByte >> (i * 8);
      numberArray.push(currentByte);
    }
  }
}

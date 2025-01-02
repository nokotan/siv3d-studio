args = args || [];
args.unshift(thisProgram);

function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

var argc = args.length;
var argv = stackAlloc((argc + 1) * 4);
var argv_ptr = argv >> 2;
args.forEach((arg) => {
  HEAPU32[argv_ptr++] = allocateUTF8OnStack(arg);
});
HEAPU32[argv_ptr] = 0;

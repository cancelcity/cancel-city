// Build-container compatibility only. This sandbox has no /proc RSS interface,
// so Node's memoryUsage() throws before Next's build-time tracing can run.
// Normal environments retain the native method; heap values come from V8.
const v8 = require('node:v8');
try {
  process.memoryUsage();
} catch (error) {
  if (error.code !== 'ENOENT' || error.syscall !== 'uv_resident_set_memory') throw error;
  const memoryUsage = () => {
    const heap = v8.getHeapStatistics();
    return { rss: 0, heapTotal: heap.total_heap_size, heapUsed: heap.used_heap_size,
      external: heap.external_memory, arrayBuffers: 0 };
  };
  // Zero denotes unavailable RSS telemetry, not measured process memory.
  memoryUsage.rss = () => 0;
  process.memoryUsage = memoryUsage;
}

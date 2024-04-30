require('dotenv').config();
const os = require('os');
const io = require('socket.io-client');
const options = {
  auth: {
    token: 'sometoken',
  },
}

// const socket = io(`http://localhost:${process.env.PORT || 3000}`, options);
// const socket = io('https://rose-spiritual-poultry.glitch.me', options);
const socket = io('https://scintillating-relic-patient.glitch.me', options);

socket.on('connect', () => {
  const networkInterface = os.networkInterfaces();
  let macA;

  for (const key in networkInterface) {
    const isInternetFacing = !networkInterface[key][0].internal;

    if (isInternetFacing) {
      macA = networkInterface[key][0].mac;
    }
  }

  const perfDataInterval = setInterval(async () => {
    const perfData = await perfomanceLoadData();

    perfData.macA = macA;

    socket.emit('perfData', perfData);
  }, 3000);

  socket.on('disconnect', () => {
    clearInterval(perfDataInterval);
  });
});

const cpuAverage = () => {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;

  cpus.forEach(aCore => {
    for (mode in aCore.times) {
      totalMs += aCore.times[mode];
    }

    idleMs += aCore.times.idle;
  });

  return {
    total: totalMs / cpus.length,
    idle: idleMs / cpus.length,
  };
}

const getCpuLoad = () => new Promise((resolve, reject) => {
  const start = cpuAverage();

  setTimeout(() => {
    const end = cpuAverage();
    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;
    const percentOfCpu = 100 - Math.floor(100 * idleDiff / totalDiff);

    resolve(percentOfCpu);
  }, 100);
});

const perfomanceLoadData = () => new Promise(async (resolve, reject) => {
  const cpus = os.cpus();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.floor(usedMem / totalMem * 100) / 100;
  const osType = os.type();
  const upTime = os.uptime();
  const cpuType = cpus[0].model;
  const numCors = cpus.length;
  const cpuSpeed = cpus[0].speed;
  const cpuLoad = await getCpuLoad();

  resolve({
    freeMem,
    totalMem,
    usedMem,
    memUsage,
    osType,
    upTime,
    cpuType,
    numCors,
    cpuSpeed,
    cpuLoad,
  });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
prisma.user.updateMany({ data: { isAdmin: true } })
    .then(function (res) { return console.log('Updated users:', res); })
    .catch(console.error)
    .finally(function () { return prisma.$disconnect(); });

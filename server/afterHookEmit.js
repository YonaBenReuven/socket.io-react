module.exports = (app, models) => {
    const { io } = app;

    // TODO Make sure everyone can add their own hooks so they can change what we wrote?
    models.forEach(({ model, room = model, roomId = "id", include, disableAfterDelete = false }) => {
        app.models[model].observe(`after save`, async ctx => {
            try {
                if (!ctx.instance) return;
                let included;
                if (include) {
                    included = (await Promise.all(include.map(relatedModel => new Promise((resolve, reject) => {
                        ctx.instance[`__get__${relatedModel}`]((err, res) => {
                            if (err) { reject(err); return; }
                            resolve({ [relatedModel]: res });
                        })
                    })))).reduce(((r, c) => Object.assign(r, c)), {});
                }

                const data = { model, method: ctx.isNewInstance ? "CREATE" : "UPDATE", instance: JSON.parse(JSON.stringify(ctx.instance)), include: included };

                io.sockets.in(`${room}-${ctx.instance[roomId]}`).emit(room, data);

                return;
            } catch (err) {
                console.log(err);
                return;
            }

        });

        // AssistantsRides ==> delete where {rideId: 2342, assistantId: 234};
        // Ride ---> delete where {id: 23423}
        if (!disableAfterDelete) {
            app.models[model].observe(`after delete`, (ctx, next) => {
                if (!ctx.where[roomId]) return next();
                const data = { model, method: "DELETE", instance: ctx.where };
                io.sockets.in(`${model}-${ctx.where[roomId]}`).emit(model, data);
                next();
            });
        }
        // app.models[model].observe(`after delete`, (ctx, next) => {
        //     const data = { model, method: "DELETE", instance: ctx.where };
        //     io.sockets.in(`${model}-${ctx.where[roomId || Object.keys(ctx.where)[0]]}`).emit(model, data);
        //     next();
        // });
    });
};
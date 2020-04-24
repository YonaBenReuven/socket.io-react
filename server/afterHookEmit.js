
module.exports = (app, models) => {
    const { io } = app;

    // TODO Make sure everyone can add their own hooks so they can change what we wrote?
    models.forEach(({ model, room = model, roomId = "id", include }) => {
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

                const data = { model, method = ctx.isNewInstance ? "CREATE" : "UPDATE", instance: JSON.parse(JSON.stringify(ctx.instance)), include: included };

                io.sockets.in(room).emit(`${room}-${ctx.instance[roomId]}`, data);

                return;
            } catch (err) {
                console.log(err);
                return;
            }

        });

        app.models[model].observe(`after delete`, (ctx, next) => {
            const data = { model, method: "DELETE", instance: ctx.where };
            io.sockets.in(model).emit(`${model}-${ctx.where[roomId || Object.keys(ctx.where)[0]]}`, data);
            next();
        });
    });
};
const Command = require('./command');
const DataGenerator = require('@tryghost/data-generator');

module.exports = class REPL extends Command {
    setup() {
        this.help('Generates random data to populate the database for development & testing');
        this.argument('--events-only', {type: 'boolean', defaultValue: false, desc: 'Only generate events, skip other datatypes'});
        this.argument('--use-existing-posts', {type: 'boolean', defaultValue: false, desc: 'Generate data referencing the set of existing posts'});
        this.argument('--use-existing-tags', {type: 'boolean', defaultValue: false, desc: 'Generate data referencing the set of existing tags'});
    }

    initializeContext(context) {
        const models = require('../server/models');
        const knex = require('../server/data/db/connection');

        models.init();

        context.models = models;
        context.m = models;
        context.knex = knex;
        context.k = knex;
    }

    async handle(argv = {}) {
        const knex = require('../server/data/db/connection');
        const {tables: schema} = require('../server/data/schema/index');
        const dataGenerator = new DataGenerator({
            useExistingPosts: argv['use-existing-posts'],
            useExistingTags: argv['use-existing-tags'],
            knex,
            schema,
            logger: {
                log: this.log,
                ok: this.ok,
                info: this.info,
                warn: this.warn,
                error: this.error,
                fatal: this.fatal,
                debug: this.debug
            },
            modelQuantities: {}
        });
        try {
            await dataGenerator.importData();
        } catch (error) {
            this.fatal('Failed while generating data: ', error);
        }
        knex.destroy();
    }
};

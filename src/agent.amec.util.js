const
    util = require('@nrd/fua.core.util');

exports = module.exports = {
    ...util,
    assert: util.Assert('agent.amec')
};

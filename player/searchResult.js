module.exports = (client, message, query, tracks) => {
    message.channel.send({
        embed: {
            color: 'RANDOM',
            author: { name: `Here are your search results for ${query}` },
            footer: { text: 'Carlo 1st!' },
            timestamp: new Date(),
            description: `${tracks.map((t, i) => `**${i + 1}** - ${t.title}`).join('\n')}`,
        },
    });
};

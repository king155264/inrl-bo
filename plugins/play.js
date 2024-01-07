const {
	inrl,
	extractUrlsFromString,
	searchYT,
	getYTInfo,
	GenListMessage,
	AudioMetaData,
	downloadMp3,
	downloadMp4,
	getBuffer,
	toAudio,
	lang
} = require('../lib');

inrl({
	pattern: 'play',
	type: "downloader",
	desc: lang.YT.PLAY_DESC
}, async (message, match) => {
	match = match || message.reply_message.text;
		if (!match) return await message.send(lang.YT.NEED_TEXT);
		const url = await extractUrlsFromString(match);
		if (!url[0]) {
			const result = await searchYT(match, true);
			if (!result[0]) return await message.send(lang.BASE.ERROR.format('_Not Found_'));
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(result[0]);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		} else {
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(url[0]);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		}
});
inrl({
	on: "text"
}, async (message, match) => {
	if (!message.reply_message?.fromMe || !message.reply_message?.text) return;
	if (!message.reply_message.text.includes('_Send number as reply to download_')) return;
		if (message.body.includes("• audio document")) {
			match = message.body.replace("• audio document", "").trim();
			await message.send(lang.BASE.DOWNLOAD.format(match));
			const result = await searchYT(match.replace('•', ''), true);
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0]);
		        const ress = await downloadMp3(result[0]);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.from, {
				document: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• audio")) {
			match = message.body.replace("• audio", "").trim();
			await message.send(lang.BASE.DOWNLOAD.format(match));
			const result = await searchYT(match.replace('•', ''), true);
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0]);
		        const ress = await downloadMp3(result[0]);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.jid, {
				audio: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video document")) {
			match = message.body.replace("• video document", "").trim();
			await message.send(lang.BASE.DOWNLOAD.format(match));
			const result = await searchYT(match.replace('•', ''), true);
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0]);
		        const ress = await downloadMp4(result[0]);
			return await message.client.sendMessage(message.from, {
				document: ress,
				mimetype:  'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video")) {
			match = message.body.replace("• video", "").trim();
			await message.send(`*_downloading_*\n*_${match}_*`);
			const result = await searchYT(match.replace('•', ''), true);
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0]);
		        const ress = await downloadMp4(result[0]);
			return await message.client.sendMessage(message.from, {
				video: ress,
				mimetype: 'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4",
				caption: title
			}, {
				quoted: message.data
			});
		}
});

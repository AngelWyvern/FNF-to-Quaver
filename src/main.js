const Readline = require('readline').createInterface({"input":process.stdin, "output":process.stdout});
const FS = require('fs');
const Path = require('path');

const Package = require('../package.json');

var mode = 3;

Readline.question('Path to FNF Chart JSON:\n', answer =>
{
	var path = Path.parse(answer.trim());
	var data = FS.readFileSync(Path.format(path).trimQuotes(), {"encoding":"utf8"});
	console.log('\n*** Original Data: ***\n' + data);
	Readline.question('\nSelect a mode: 1 = BF Only | 2 = Opponent Only | 3 = Both\n', answer =>
	{
		mode = parseInt(answer);
		parseJson(JSON.parse(data), path.name);
		process.exit(0);
	});
});

function parseJson(object, name = 'output')
{
	var song = object.song;
	var sections = song.notes;
	var kv = new String();

	kv = kv.addLine(`AudioFile: audio.mp3`);
	kv = kv.addLine(`BackgroundFile: ''`);
	kv = kv.addLine(`MapId: -1`);
	kv = kv.addLine(`MapSetId: -1`);
	kv = kv.addLine(`Mode: Keys4`);
	kv = kv.addLine(`Title: ${song.song}`);
	kv = kv.addLine(`Artist: FNFtQ`);
	kv = kv.addLine(`Source: Friday Night Funkin`);
	kv = kv.addLine(`Tags: FNF,Funkin`);
	kv = kv.addLine(`Creator: FNFtQ`);
	kv = kv.addLine(`DifficultyName: ${name.endsWith('-easy') ? 'EASY' : name.endsWith('-hard') ? 'HARD' : 'NORMAL'}`);
	kv = kv.addLine(`Description: Generated by FNF-to-Quaver v${Package.version}`);
	kv = kv.addLine(`EditorLayers: []`);
	kv = kv.addLine(`CustomAudioSamples: []`);
	kv = kv.addLine(`SoundEffects: []`);
	kv = kv.addLine(`TimingPoints:`);
	kv = kv.addLine(`-  Bpm: ${song.bpm}`);
	kv = kv.addLine(`SliderVelocities: []`);
	kv = kv.addLine(`HitObjects:`);
	for (var i = 0; i < song.notes.length; i++)
	{
		if (sections[i].sectionNotes == undefined)
			continue;

		for (var n = 0; n < sections[i].sectionNotes.length; n++)
		{
			var strumtime = sections[i].sectionNotes[n][0];
			var notedata = sections[i].sectionNotes[n][1];
			var suslength = sections[i].sectionNotes[n][2];

			// mode checks
			if (mode == 1 && ((sections[i].mustHitSection && notedata > 3) || (!sections[i].mustHitSection && notedata < 4)))
				continue;
			else if (mode == 2 && ((!sections[i].mustHitSection && notedata > 3) || (sections[i].mustHitSection && notedata < 4)))
				continue;
			
			// convert to quaver notes
			kv = kv.addLine(`- StartTime: ${Math.round(strumtime)}`);
			kv = kv.addLine(`  Lane: ${(notedata % 4) + 1}`);
			if (suslength > 1)
				kv = kv.addLine(`  EndTime: ${Math.round(strumtime + suslength)}`);
			kv = kv.addLine(`  KeySounds: []`);
		}
	}
	if (kv.endsWith('HitObjects:')) kv += ' []'; // if nothing was added
	console.log('\n*** New Data: ***\n' + kv);
	console.log(`\nOutputting to "${name}.qua"...`);
	if (!FS.existsSync('./output')) FS.mkdirSync('./output');
	FS.writeFileSync(`./output/${name}.qua`, kv);
}

String.prototype.addLine = function(str)
{
	return this + (this.length > 1 ? '\n' : '') + str;
};

String.prototype.trimQuotes = function()
{
	var str = this.valueOf();
	if (str.startsWith('"')) str = str.substring(1);
	if (str.endsWith('"')) str = str.slice(0, -1);
	return str;
};
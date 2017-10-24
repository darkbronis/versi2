const LineAPI = require('./api');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
let exec = require('child_process').exec;

const myBot = ['u7b8f35567fee016d196112004b6e3573','u6b39c1ff2dfa8396706ef56ddd9f1e89','u537cd3fc00f69ae4876c0c1a330468d0','u284a00111c0fa26e742da1c1f3e9dcbc'];


function isAdminOrBot(param) {
    return myBot.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancelprotect: 0,
            kickersprotect: 0,
            qrprotect: 0,
        } 
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            // console.log(operation);
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            this.textMessage(txt,message)
        }

        if(operation.type == 13 && this.stateStatus.cancelprotect == 1) {
            this.cancelAll(operation.param1);
				}
				
			  if(operation.type == 26) {
					  this._client.removeAllMessages(operation.param1);
				}
			
			  if(operation.type == 16) {
					  let anu = new Message();
					  anu.to = operation.param1;
					  anu.text = "₡yber•∅peration•₮eam joined into the group\n\nType [cot key] for using ₡•∅•₮ Bot\n\n=====WARNING!!!=====\nSelalu Gunakan Huruf Kecil Pada Keyword"
					  this._client.sendMessage(0, anu);
				}
			
			  if(operation.type == 17) {
					  let anu = new Message();
					  anu.to = operation.param1;
					  anu.text = "Welcome to the group\n\nType [cot key] for using ₡•∅•₮ Bot\n\n=====WARNING!!!=====\nSelalu Gunakan Huruf Kecil Pada Keyword"
					  this._client.sendMessage(0, anu);
				}
			
        if(operation.type == 19) { //script protect <4mid 3bot recommend>
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
            if(isAdminOrBot(operation.param3)) {
                this._invite(operation.param1,[operation.param3]);
            }
            if(!isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 

        }
      
        if(operation.type == 11 && this.stateStatus.qrprotect == 1) {
            if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
            } 
          
        }
  
        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { //notified_invite_into_group
             this._acceptGroupInvitation(operation.param1);
             if(!isAdminOrBot(operation.param2) && !isAdminOrBot(operation.param3)) {
                 this._cancel(operation.param1,[operation.param3]);
             }
        }
        this.getOprationType(operation);
    }

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }

    setState(seq) {
    if(seq == 1){
      let isinya = "========>₡•∅•₮<========\n";
      for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
          if(this.stateStatus[k]==1){
            isinya += " "+firstToUpperCase(k)+" => ON\n";
          }else{
            isinya += " "+firstToUpperCase(k)+" => OFF\n";
          }
                }
            }this._sendMessage(seq,isinya);
    }else{
        if(isAdminOrBot(seq.from)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
      let isinya = "========>₡•∅•₮<========\n";
      for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
          if(this.stateStatus[k]==1){
            isinya += " "+firstToUpperCase(k)+" => ON\n";
          }else{
            isinya += " "+firstToUpperCase(k)+" => OFF\n";
          }
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
      this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`you must have permission`);
        }}
    }
  
   // setState(seq) {
     //   if(isAdminOrBot(seq.from)){
         //   let [ actions , status ] = seq.text.split(' ');
        //    const action = actions.toLowerCase();
        //    const state = status.toLowerCase() == 'on' ? 1 : 0;
         //   this.stateStatus[action] = state;
       //     this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
      //  } else {
        //    this._sendMessage(seq,`<SysTeM private keyword only for FahmiAndrean>`);
     //   }
  //  }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

    async leftGroupByName(payload) {
        let gid = await this._findGroupByName(payload);
        for (var i = 0; i < gid.length; i++) {
            this._leaveGroup(gid[i]);
        }
    }
    
    async check(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }

    async textMessage(textMessages, seq) {
        let [ cmd, ...payload ] = textMessages.split(' ');
        payload = payload.join(' ');
        let txt = textMessages.toLowerCase();
        let messageID = seq.id;
        
     //   var qrprotect = await this._getGroup(seq.to);
      
        var group = await this._getGroup(seq.to);
      
        var date = new Date();
        var bulanku = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        var hariku = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum&#39;at', 'Sabtu'];
        var tanggal = date.getDate();
        var bulan = date.getMonth(),
            bulan = bulanku[bulan];
        var hariIni = date.getDay(),
            hariIni = hariku[hariIni];
        var tahun = date.getFullYear();
        var menit = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','00'];
        var jam = ['11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07','08','09','10','11'];
        var hh = jam[date.getHours()];
        var mm = menit[date.getMinutes()];
        var ss = menit[date.getSeconds()];
                           
        if(cmd == 'thiscancel') {
            if(payload == 'group') {
                let groupid = await this._getGroupsInvited();
                for (let i = 0; i < groupid.length; i++) {
                    this._rejectGroupInvitation(groupid[i])                    
                }
                return;
            }
            if(this.stateStatus.cancelprotect == 1) {
                this.cancelAll(seq.to);
            }
        }

  //      if(qrprotect.preventJoinByTicket==false&&!isAdminOrBot(seq.from)){
     //       this._sendMessage(seq,'==We Protect This QR code==');
            //this._kickMember(seq.to,[seq.from]);
       //     qrprotect.preventJoinByTicket=true;
       //     await this._updateGroup(qrprotect);
    //    }
      
        if(txt == 'respon') {
            this._sendMessage(seq, '₡•∅•₮\n\n|V.1 Active|');
        }

        if(txt == 'cot keyword' || txt == 'cot help' || txt == 'cot key') {
	          this._sendMessage(seq, '===============\n|₡•∅•₮|\n|For All User|\n===============\n∆ Creator\n∆ Me\n∆ thisCancel\n∆ respon\n∆ Connection\n∆ Reader\n∆ Reset Read\n∆ Check Read\n∆ gCreator\n∆ gInfo\n∆ Today\n∆ Status Bot\n∆ Myid\n∆ Gift\n∆ Join <linkGroup>\n\n===============\n|₡•∅•₮|\n|Admin User|\n===============\n√• Delete @\n√• KickersProtect on/off\n√• CancelProtect on/off\n√• QrProtect on/off\n√• Openurl\n√• Closeurl\n√• Konspirasi\n√• TagMember\n√• Up\n√• CotBye\n===============\n₡yber•∅peration•₮eam\nKeep Support:)\n===============');
        }

			  if(txt == 'status bot') {
					  this._sendMessage(seq,`| Bot : WORKING\n\n| Bot Version : 1-2-3\n\n| Owner : line.me/ti/p/~fahmiadrn\n\n========₡•∅•₮========\n${JSON.stringify(this.stateStatus)}`);
				}
					
        if(txt == 'gcreator') {
            let creator = group.creator.mid;
            seq.contentType = 13
            seq.contentMetadata = { mid: `${creator}` };
            this._client.sendMessage(1, seq);
        }
      
        if(txt == 'ginfo') {
            let name = group.name;
            let id = group.id;
            let creator = group.creator.displayName;
            let members = group.members.length;
            let pending = group.invitee.length;
            let qrcode = group.preventJoinByTicket;
            this._sendMessage(seq, `====================\n⚫ Nama Group :\n    ${name}\n\n⚫   ID Group :\n    ${id}\n\n⚫   Creator Group :\n    ${creator}\n\n⚫   Jumlah Member :   ${members}\n\n⚫   Jumlah Pendingan :   ${pending}\n\n⚫   QR Code :\   ${qrcode}\n====================`);
        }
      
        if(txt == 'creator') {
            seq.contentType = 13
            seq.contentMetadata = { mid: 'u7b8f35567fee016d196112004b6e3573' };
            this._client.sendMessage(1, seq);
        }
      
        if(txt == 'me') {
    	      seq.contentType= 13
            seq.contentMetadata = { mid: seq.from };
            this._client.sendMessage(1, seq);
        }
          
        if(txt == 'connection') {
            const curTime = (Date.now() / 1000);
            await this._sendMessage(seq,'Checking Connection....');
            const rtime = (Date.now() / 1000) - curTime;
            await this._sendMessage(seq, `${rtime} second(s)`);
        }

        if(txt == 'today') {
            let menit = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','00'];
            let jam = ['11','12','13','14','15','16','17','18','19','20','21','22','23','00','01','02','03','04','05','06','07','08','09','10','11'];
            let hh = jam[date.getHours()];
            let mm = menit[date.getMinutes()];
            let ss = menit[date.getSeconds()];
            this._sendMessage(seq, `📌 Pukul, ${hh} : ${mm} : ${ss} WIB\n\n🌍 ${hariIni}, ${tanggal} ${bulan} ${tahun}`);
        }
          
        if(txt == 'konspirasi' && isAdminOrBot(seq.from)) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid]);
                }
            }
        }

        if(txt == 'reader') {
            this._sendMessage(seq, `Check Reader Point set!`);
            this.removeReaderByGroup(seq.to);
        }

        if(txt == 'reset read') {
            this.checkReader = []
            this._sendMessage(seq, `Check Reader Point reset!`);
        }
			
        
      	if(txt == 'tagmember' && isAdminOrBot (seq.from)) {
            let rec = await this._getGroup(seq.to);
            const mentions = await this.mention(rec.members);
   	        seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
        }

			
        if(txt == 'check read'){
            let rec = await this.check(this.checkReader,seq.to);
            const mentions = await this.mention(rec);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
            
        }
          
     //   if(seq.contentType == 13) {
      //      seq.contentType = 0
      //      this._sendMessage(seq,seq.contentMetadata.mid);
    //    }
	
        const action = ['cancelprotect on','cancelprotect off','kickersprotect on','kickersprotect off','qrprotect on','qrprotect off']
        if(action.includes(txt)) {
            this.setState(seq)
        }
	
        if(cmd == 'delete' && isAdminOrBot(seq.from)) {
          let target = payload.replace('@','');
          let group = await this._getGroups([seq.to]);
          let gm = group[0].members;
            for(var i = 0; i < gm.length; i++){
                if(gm[i].displayName == target){
                        target = gm[i].mid;
                }
            }
            this._kickMember(seq.to,[target]);
        }

        if(txt == 'myid') {
            this._sendMessage(seq,`This Your MID: ${seq.from}`);
        }

        const joinByUrl = ['openurl','closeurl'];
        if(joinByUrl.includes(txt) && isAdminOrBot(seq.from)) {
            this._sendMessage(seq,`Wait a minute....`);
            let updateGroup = await this._getGroup(seq.to);
            updateGroup.preventJoinByTicket = true;
            if(txt == 'openurl') {
                updateGroup.preventJoinByTicket = false;
                const groupUrl = await this._reissueGroupTicket(seq.to)
                this._sendMessage(seq, `QR Code = line://ti/g/${groupUrl}`);
            }
            await this._updateGroup(updateGroup);
        }

        if(cmd == 'up' && isAdminOrBot(seq.from)) {
            for(var i= 0; i < 4;  i++) {
               this._sendMessage(seq, 'Berbau Micin nih\n\n\n\n\n\n\n\n\n\nDududududd (^-^)');
            }
        }
      
        if(txt == 'gift') {
           	seq.contentType = 9
            seq.contentMetadata = {'PRDID': 'a0768339-c2d3-4189-9653-2909e9bb6f58','PRDTYPE': 'THEME','MSGTPL': '6'};
            this._client.sendMessage(1, seq);
        }
      
        if(cmd == 'join') { //untuk join group pake qrcode contoh: join line://anu/g/anu
            const [ ticketId ] = payload.split('g/').splice(-1);
            let { id } = await this._findGroupByTicket(ticketId);
            await this._acceptGroupInvitationByTicket(id,ticketId);
        }
        
        if(cmd == 'spm' && isAdminOrBot(seq.from)) { // untuk spam invite contoh: spm <mid>
            for (var i = 0; i < 100; i++) {
                this._createGroup(`SysTeM INV SPAM`,payload);
                this._inviteMid(seq.to)
            }
        }
        
        if(txt == 'cotbye'  && isAdminOrBot(seq.from)) { //untuk left dari group atau spam group contoh left <alfath>
            let txt = await this._sendMessage(seq,'We Gonna Leaveeeeeee~~~~\nRun\n\nThx For Using (×-×)');
            this._leaveGroup(seq.to);
        }
			
        if(txt == 'leave' && isAdminOrBot(seq.from)) {
            this._leaveGroup(seq.to);
        }

    }

}

	

module.exports = new LINE();

import { NatsConnection, StringCodec, Subscription } from "nats";
import { PatientStore } from "../../KafkaTopicsListener/Patientservice";

export class PatientNats {
  async PatientNatsSubscriber(nc: NatsConnection) {
    const sc = StringCodec();
    const sub = nc.subscribe("Patient");
    (async (sub: Subscription) => {
      console.log(`listening for ${sub.getSubject()} requests...`);
      for await (const m of sub) {
        const decoder = new TextDecoder("utf-8");
        console.log(decoder.decode(m.data))
        const payload = JSON.parse(decoder.decode(m.data));
        if (payload.type == "get") {
          const finalres = PatientStore[payload.patientId];
          if (finalres && finalres.isExist == true) {
            if (m.respond(sc.encode(JSON.stringify(finalres)))) {
              console.info(`[Patient] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[Patient] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          } else {
            console.log("not found");
            if (m.respond(sc.encode("404"))) {
              console.info(`[Patient] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[Patient] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          }
        } else if (payload.type == "getAll") {
          const allPatient: any = PatientStore;
          const limit = payload.limit;
          console.log("payload.patientId",payload.patientId)
          // let finalRes = Object.values(allstudent).filter((item: any) => {
          //   return item.departmentno == payload.departmentno && item.isExist == true || item.isExist == false;
          // });
          let finalRes = Object.values(allPatient).filter((item: any) => {
            if (payload.patientId){
              return item.patientId == payload.patientId && item.isExist == true;
            }
            return item.isExist == true;
          });
          if (limit) {
            finalRes = finalRes.slice(0, limit);
          }

          if (m.respond(sc.encode(JSON.stringify(finalRes)))) {
            console.info(`[Patient] handled #${sub.getProcessed()}`);
          } else {
            console.log(
              `[Patient] #${sub.getProcessed()} ignored - no reply subject`
            );
          }
        }
      }
      console.log(`subscription ${sub.getSubject()} drained.`);
    })(sub);
  }
}

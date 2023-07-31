import { connect } from "nats";
import { nat_server } from "../admin";
import { PatientNats } from "./Patientservice";

// const MedicalHistoryNatsService = new MedicalHistoryNats();
const PatientNatsService = new PatientNats();
// const SmokeHistoryNatsService = new SmokeHistoryNats();
export async function natsSubscriber() {
  const nc = await connect({ servers: nat_server })
    .then((con) => {
      console.log("nats cconnection success");
      return con;
    })
    .catch((err) => {
      console.log(`nats error: ${err}`);
      return null;
    });
  if (nc != null) {
    // MedicalHistoryNatsService.MedicalHistoryNatsSubscriber(nc);
    PatientNatsService.PatientNatsSubscriber(nc);
    // SmokeHistoryNatsService.SmokeHistoryNatsSubscriber(nc);
  }
}

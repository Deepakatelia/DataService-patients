import { PatientTopicsListening } from "./Patientservice";



const PatientTopicsService  = new PatientTopicsListening();


export async function kafkaTopicsListening() {
  PatientTopicsService.PatientTopicsListening();

}

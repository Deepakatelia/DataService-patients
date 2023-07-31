import { Kafka } from "kafkajs";
import { kafka_server } from "../../admin";
import { db } from "../../db";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [kafka_server],
});

export var PatientStore = {};

export class PatientTopicsListening {
  async PatientTopicsListening() {
    var latestCount;
    const topicRef = await db.collection("Patient_GROUP").doc("Patient").get();
    if (topicRef.data()) {
      var count = topicRef.data().count + 1;
      await topicRef.ref.update({ count: count });
      latestCount = count;
    } else {
      const topicRef = db.collection("CONSUMER_GROUP").doc("Patient");
      await topicRef.set({
        count: 1,
        consumer_group_name: "Patient",
      });
      latestCount = 1;
    }
    if (latestCount) {
      const consumer = kafka.consumer({
        groupId: `Patient-group${latestCount}`,
      });
      await consumer.connect();
      await consumer.subscribe({ topic: "Patient", fromBeginning: true });
      await consumer.run({
        eachMessage: async (data) => {
          const { topic, partition, message } = data;
          const operation = message.key.toString().split("#")[0];
          const key = message.key.toString().split("#")[1];
          if (operation == "create" && message.value) {
            const obj = JSON.parse(message.value.toString("utf8"));
            PatientStore[key] = obj;
            console.log("data sent to local");
            console.log(PatientStore);
          } else if (operation == "update" && message.value) {
            const obj = JSON.parse(message.value.toString("utf8"));
            console.log("request",obj)
            let result = PatientStore[key];
            PatientStore[key] = {
              ...result,
              ...obj,
            };
            console.log("data updated in store");
          } else if (operation == "delete" && message.value) {
            const obj = JSON.parse(message.value.toString("utf8"));
            PatientStore[key] = obj;
            let result = PatientStore[key];
            PatientStore[key] = {
              ...result,
              ...obj,
            };
          }
        },
      });
    }
  }
}

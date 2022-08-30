<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useServices } from "@/services";
import { useNotification } from "@/stores/notification";
const { grantAccessService } = useServices();
const route = useRoute();
const notification = useNotification();
const isPending = ref(false);
const upAddress = ref("");
const recoverProcessId = ref("");
const newOwnerAddress = ref("");

onMounted(() => {
  notification.clearNotification();
});

const vote = async (
  upAddress: string,
  recoverProcessId: string,
  newOwnerAddress: string
) => {
  console.log("vote:", upAddress, recoverProcessId, newOwnerAddress);
  isPending.value = true;
  try {
    await grantAccessService.vote(upAddress, recoverProcessId, newOwnerAddress);
    notification.setNotification("Vote success.", "primary");
  } catch (error: any) {
    console.log("vote err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};
</script>
<template>
  <div
    v-if="
      route.query.upAddress &&
      route.query.recoverProcessId &&
      route.query.newOwnerAddress
    "
  >
    <div class="columns">
      <div class="column is-8 is-offset-2 box">
        <div class="field">
          <label class="title">Universal Profile address:</label>
        </div>
        <div class="field">
          <div class="control">
            <input
              class="input"
              type="text"
              :value="route.query.upAddress"
              disabled
            />
          </div>
        </div>
        <div class="field">
          <label class="title">Recover process id:</label>
        </div>
        <div class="field">
          <div class="control">
            <input
              class="input"
              type="text"
              :value="route.query.recoverProcessId"
              disabled
            />
          </div>
        </div>
        <div class="field">
          <label class="title">New owner address:</label>
        </div>
        <div class="field">
          <div class="control">
            <input
              class="input"
              type="text"
              :value="route.query.newOwnerAddress"
              disabled
            />
          </div>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="vote"
            @click="
              vote(
                route.query.upAddress as string,
                route.query.recoverProcessId as string,
                route.query.newOwnerAddress as string
              )
            "
          >
            vote
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="columns">
      <div class="column is-8 is-offset-2 box">
        <div class="field">
          <label class="label">Universal Profile address</label>
          <div class="control">
            <input v-model="upAddress" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">Recover process id</label>
          <div class="control">
            <input v-model="recoverProcessId" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">New owner address</label>
          <div class="control">
            <input v-model="newOwnerAddress" class="input" type="text" />
          </div>
        </div>
        <div class="field">
          <button
            :class="`button is-primary is-rounded mb-3 ${
              isPending ? 'is-loading' : ''
            }`"
            data-testid="vote"
            @click="vote(upAddress, recoverProcessId, newOwnerAddress)"
          >
            vote
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

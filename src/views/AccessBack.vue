<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAccessBack } from "@/stores/accessBack";
import { useServices } from "@/services";
import { useNotification } from "@/stores/notification";
const accessBackStore = useAccessBack();
const { accessBackService } = useServices();
const notification = useNotification();
const step = ref(1);
const isPending = ref(false);
const upAddress = ref(accessBackStore.upAddress);
accessBackStore.$subscribe(async (mutation, state) => {
  if (state.upAddress && !upAddress.value) {
    upAddress.value = accessBackStore.upAddress;
  }
});

onMounted(() => {
  notification.clearNotification();
});

//step 1
const enterUPAddress = async () => {
  isPending.value = true;
  try {
    await accessBackService.setUPAddress(upAddress.value);
    step.value = 2;
  } catch (error: any) {
    console.log("updatePassword err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

//step 2
const newRecoverProcessId = ref("");

const createRecoverProcess = async () => {
  isPending.value = true;
  try {
    await accessBackService.createRecoverProcess(newRecoverProcessId.value);
    notification.setNotification("create recover process success.", "primary");
  } catch (error: any) {
    console.log("createRecoverProcess err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};

const toRecoverOwnership = async (processId: string) => {
  recoverProcessId.value = processId;
  step.value = 3;
};

//step 3
const recoverProcessId = ref("");
const password = ref("");
const newPassword = ref("");

const recoverOwnership = async () => {
  isPending.value = true;
  try {
    await accessBackService.recoverOwnership(
      recoverProcessId.value,
      password.value,
      newPassword.value
    );
    notification.setNotification("recover success.", "primary");
  } catch (error: any) {
    console.log("recoverOwnership err:", error);
    notification.setNotification(error.message);
  }
  isPending.value = false;
};
</script>
<template>
  <section class="section">
    <div v-if="step === 1" data-testid="step1">
      <div class="mb-6"></div>
      <div class="columns">
        <div class="column is-6 is-offset-3 box">
          <div class="field">
            <label class="title">Please enter universal profile address:</label>
            <div class="control">
              <input v-model="upAddress" class="input" type="text" />
            </div>
          </div>
          <div class="field">
            <button
              :class="`button is-primary is-rounded mb-3 ${
                isPending ? 'is-loading' : ''
              }`"
              data-testid="enterUPAddress"
              @click="enterUPAddress"
            >
              next
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="step === 2 && accessBackStore.upAddress.length > 0"
      data-testid="step2"
    >
      <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent is-12">
          <div class="tile is-child box">
            <div class="field">
              <label class="title">create new recover process:</label>
            </div>
            <div class="field">
              <label class="label">recover process id:</label>
              <div class="control">
                <input
                  v-model="newRecoverProcessId"
                  class="input"
                  type="text"
                />
              </div>
            </div>
            <div class="field">
              <button
                :class="`button is-primary is-rounded mb-3 ${
                  isPending ? 'is-loading' : ''
                }`"
                data-testid="createRecoverProcess"
                @click="createRecoverProcess"
              >
                create
              </button>
            </div>
          </div>

          <div class="tile is-child box">
            <div class="field">
              <label class="title">recover process info:</label>
            </div>
            <div class="field">
              <label class="label">guardians:</label>
              <div
                v-for="item in accessBackStore.guardianAddressList"
                :key="item"
                class="control"
              >
                <input class="input" type="text" :value="item" disabled />
              </div>
            </div>
            <div class="field">
              <label class="label"
                >guardians threshold:
                {{ accessBackStore.guardianThreshold }}</label
              >
            </div>
            <div
              v-if="accessBackStore.recoverProcessList.length > 0"
              data-testid="recoverProcessList"
              class="field table-container"
            >
              <table
                class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
              >
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Process id</th>
                    <th>Guardians voted</th>
                    <th>Grant access url</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="process in accessBackStore.recoverProcessList"
                    :key="process.processId"
                  >
                    <td>
                      <button
                        :class="`button is-primary is-rounded mb-3 ${
                          isPending ? 'is-loading' : ''
                        }`"
                        :disabled="
                          process.guardiansVoted.length >=
                          accessBackStore.guardianThreshold
                            ? undefined
                            : true
                        "
                        data-testid="toRecoverOwnership"
                        @click="toRecoverOwnership(process.processId)"
                      >
                        To recover
                      </button>
                    </td>
                    <td>{{ process.processId }}</td>
                    <td>{{ process.guardiansVoted.join(";") }}</td>
                    <td>{{ process.grantAccessUrl }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="step === 3 && recoverProcessId.length > 0"
      data-testid="step3"
    >
      <div class="tile is-ancestor">
        <div class="tile is-child box">
          <div class="field">
            <label class="label">Recover ownership:</label>
          </div>
          <div class="field">
            <label class="label"
              >recover process id:{{ recoverProcessId }}</label
            >
          </div>
          <div class="field">
            <label class="label">password</label>
            <div class="control">
              <input v-model="password" class="input" type="password" />
            </div>
          </div>
          <div class="field">
            <label class="label">new password</label>
            <div class="control">
              <input v-model="newPassword" class="input" type="password" />
            </div>
          </div>
          <div class="field">
            <button
              :class="`button is-primary is-rounded mb-3 ${
                isPending ? 'is-loading' : ''
              }`"
              data-testid="recoverOwnership"
              @click="recoverOwnership"
            >
              Recover ownership
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

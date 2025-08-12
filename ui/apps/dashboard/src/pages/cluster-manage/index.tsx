/*
Copyright 2024 The Karmada Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import i18nInstance from '@/utils/i18n';
import Panel from '@/components/panel';
import { message } from 'antd';
import NewClusterModal from './new-cluster-modal';
import { useState } from 'react';
import { ClusterList } from '@/features/clusters';
import { useClusterEvents } from '@/features/clusters';
import { useClusterDetail } from '@/features/clusters';
import { RequireRole } from '@/components/auth';
import { ClusterResourceSummary } from '@/components/charts/ClusterResourceSummary';
import { useClusters } from '@/features/clusters';
function getPercentColor(v: number): string {
  // 0~60 #52C41A
  // 60~80 #FAAD14
  // > 80 #F5222D
  if (v <= 60) {
    return '#52C41A';
  } else if (v <= 80) {
    return '#FAAD14';
  } else {
    return '#F5222D';
  }
}
const ClusterManagePage = () => {
  useClusterEvents();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [clusterModalData, setModalData] = useState<{
    mode: 'create' | 'edit';
    open: boolean;
    clusterName?: string;
  }>({
    mode: 'create',
    open: false,
  });
  const { data: clustersData } = useClusters();
  const { data: currentDetail } = useClusterDetail(clusterModalData.clusterName || '');

  return (
    <Panel>
      <ClusterList
        onCreate={() => setModalData({ mode: 'create', open: true })}
        onEdit={(c) => setModalData({ mode: 'edit', open: true, clusterName: c.objectMeta.name })}
      />

      <div className="mt-4">
        {clustersData?.map((c) => (
          <div key={c.objectMeta.uid} className="mb-4">
            <ClusterResourceSummary cluster={c} />
          </div>
        ))}
      </div>
      {messageContextHolder}
      <NewClusterModal
        mode={clusterModalData.mode}
        open={clusterModalData.open}
        clusterDetail={currentDetail}
        onOk={async () => {
          await messageApi.success('保存成功');
          setModalData({ ...clusterModalData, open: false });
        }}
        onCancel={async () => {
          setModalData({ ...clusterModalData, open: false });
        }}
      />
    </Panel>
  );
};
export default ClusterManagePage;

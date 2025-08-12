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
import { Badge, Descriptions, DescriptionsProps, Statistic, Spin, Tabs } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { GetOverview } from '@/services/overview.ts';
import dayjs from 'dayjs';
import { useClusters } from '@/features/clusters';
import { ClusterTopology } from '@/components/charts/ClusterTopology';
import { ClusterTimeSeries } from '@/components/charts/ClusterTimeSeries';

const Overview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['GetOverview'],
    queryFn: async () => {
      const ret = await GetOverview();
      return ret.data;
    },
  });
  const { data: clusters } = useClusters();
  const basicItems: DescriptionsProps['items'] = [
    {
      key: 'karmada-version',
      label: i18nInstance.t('66e8579fa53a0cdf402e882a3574a380', 'Karmada版本'),
      children: data?.karmadaInfo.version.gitVersion || '-',
    },
    {
      key: 'karmada-status',
      label: i18nInstance.t('3fea7ca76cdece641436d7ab0d02ab1b', '状态'),
      children:
        data?.karmadaInfo.status === 'running' ? (
          <Badge
            color={'green'}
            text={i18nInstance.t('d679aea3aae1201e38c4baaaeef86efe', '运行中')}
          />
        ) : (
          <Badge
            color={'red'}
            text={i18nInstance.t(
              '903b25f64e1c0d9b7f56ed80c256a2e7',
              '未知状态',
            )}
          />
        ),
    },
    {
      key: 'karmada-create-time',
      label: i18nInstance.t('eca37cb0726c51702f70c486c1c38cf3', '创建时间'),
      children:
        (data?.karmadaInfo.createTime &&
          dayjs(data?.karmadaInfo.createTime).format('YYYY-MM-DD HH:mm:ss')) ||
        '-',
    },
    {
      key: 'cluster-info',
      label: i18nInstance.t('a0d6cb39b547d45a530a3308dce79c86', '工作集群信息'),
      children: (
        <>
          <div>
            <span>
              {i18nInstance.t('6860e13ac48e930f8076ebfe37176b78', '节点数量')}
            </span>
            ：
            <span>
              {data?.memberClusterStatus.nodeSummary.readyNum}/
              {data?.memberClusterStatus.nodeSummary.totalNum}
            </span>
          </div>
          <div>
            <span>
              {i18nInstance.t(
                'a1dacced95ddca3603110bdb1ae46af1',
                'CPU使用情况',
              )}
            </span>
            ：
            <span>
              {data?.memberClusterStatus.cpuSummary.allocatedCPU &&
                data?.memberClusterStatus.cpuSummary.allocatedCPU.toFixed(2)}
              /{data?.memberClusterStatus.cpuSummary.totalCPU}
            </span>
          </div>
          <div>
            <span>
              {i18nInstance.t(
                '5eaa09de6e55b322fcc299f641d73ce7',
                'Memory使用情况',
              )}
            </span>
            ：
            <span>
              {data?.memberClusterStatus?.memorySummary?.allocatedMemory &&
                (
                  data.memberClusterStatus.memorySummary.allocatedMemory /
                  8 /
                  1024 /
                  1024
                ).toFixed(2)}
              GiB /
              {data?.memberClusterStatus?.memorySummary?.totalMemory &&
                data.memberClusterStatus.memorySummary.totalMemory /
                  8 /
                  1024 /
                  1024}
              GiB
            </span>
          </div>
          <div>
            <span>
              {i18nInstance.t(
                '820c4003e23553b3124f1608916d5282',
                'Pod分配情况',
              )}
            </span>
            ：
            <span>
              {data?.memberClusterStatus?.podSummary?.allocatedPod}/
              {data?.memberClusterStatus?.podSummary?.totalPod}
            </span>
          </div>
        </>
      ),

      span: 3,
    },
  ];

  const resourceItems: DescriptionsProps['items'] = [
    {
      key: 'policy-info',
      label: i18nInstance.t('85c6051762df2fe8f93ebc1083b7f6a4', '策略信息'),
      children: (
        <div className="flex flex-row space-x-4">
          <Statistic
            title={i18nInstance.t(
              'a95abe7b8eeb55427547e764bf39f1c4',
              '调度策略',
            )}
            value={data?.clusterResourceStatus.propagationPolicyNum}
          />

          <Statistic
            title={i18nInstance.t(
              '0a7e9443c41575378d2db1e288d3f1cb',
              '差异化策略',
            )}
            value={data?.clusterResourceStatus.overridePolicyNum}
          />
        </div>
      ),

      span: 3,
    },
    {
      key: 'multicloud-resources-info',
      label: i18nInstance.t('612af712ef5ed7868a6b2f1d3d68530c', '多云资源信息'),
      children: (
        <div className="flex flex-row space-x-4">
          <Statistic
            title={i18nInstance.t(
              '1200778cf86309309154ef88804fa22e',
              '多云命名空间',
            )}
            value={data?.clusterResourceStatus.namespaceNum}
          />

          <Statistic
            title={i18nInstance.t(
              '3692cf6a2e079d34e7e5035aa98b1335',
              '多云工作负载',
            )}
            value={data?.clusterResourceStatus.workloadNum}
          />

          <Statistic
            title={i18nInstance.t(
              '2030a6e845ad6476fecbc1711c9f139d',
              '多云服务与路由',
            )}
            value={data?.clusterResourceStatus.serviceNum}
          />

          <Statistic
            title={i18nInstance.t(
              '0287028ec7eefa1333b56ee340d325a0',
              '多云配置与秘钥',
            )}
            value={data?.clusterResourceStatus.configNum}
          />
        </div>
      ),

      span: 3,
    },
  ];

  return (
    <Panel>
      {isLoading ? (
        <Spin />
      ) : (
        <div className={"p-[12px]"}>
          <div className={"flex flex-row gap-4"}>
            <div className={"grow"}>
              <Descriptions column={2} bordered title={i18nInstance.t('f5b8933bca46d6b58fc7244b61fa886d','基础信息')} items={basicItems} />
            </div>
            <div className={"min-w-[260px] flex flex-col gap-4"}>
              <Statistic title={i18nInstance.t('a4e6c34dcb5b0898f1d9e5c244f2b6c5','命名空间数量')} value={data?.clusterResourceStatus.namespaceNum} />
              <Statistic title={i18nInstance.t('b0d0c3573d3b3106d3f1c9d0a01634f2','工作负载数量')} value={data?.clusterResourceStatus.workloadNum} />
            </div>
          </div>
          <div className="mt-6">
            <Tabs
              items={[
                {
                  key: 'topology',
                  label: i18nInstance.t('c2b4f5e7f44a48b791d1ad63dc3f29e2', '拓扑视图'),
                  children: clusters ? <ClusterTopology clusters={clusters} /> : null,
                },
                {
                  key: 'timeseries',
                  label: i18nInstance.t('c3b09b7f0c2b4cc295dd1f5a7d4b5c1a', '时间序列'),
                  children: clusters ? <ClusterTimeSeries clusters={clusters} /> : null,
                },
              ]}
            />
          </div>
        </div>
      )}
    </Panel>
  );
};

export default Overview;

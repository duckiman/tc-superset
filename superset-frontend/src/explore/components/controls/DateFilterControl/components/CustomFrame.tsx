/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t } from '@apache-superset/core/translation';
import { customTimeRangeDecode } from '@superset-ui/core';
import {
  InfoTooltip,
  DatePicker,
  AntdThemeProvider,
  Col,
  Row,
  Loading,
} from '@superset-ui/core/components';
import {
  DAYJS_FORMAT,
  customTimeRangeEncode,
  dttmToDayjs,
} from 'src/explore/components/controls/DateFilterControl/utils';
import {
  CustomRangeKey,
  FrameComponentProps,
} from 'src/explore/components/controls/DateFilterControl/types';
import { Dayjs } from 'dayjs';
import { useLocale } from 'src/hooks/useLocale';

export function CustomFrame(props: FrameComponentProps) {
  console.log('CustomFrame props.value:', props.value);
  const { customRange, matchedFlag } = customTimeRangeDecode(props.value);
  console.log('Decoded customRange:', customRange);
  console.log('matchedFlag:', matchedFlag);
  const datePickerLocale = useLocale();
  
  // Validate và fix sinceDatetime nếu là ngày invalid
  let validatedSinceDatetime = customRange.sinceDatetime;
  let validatedUntilDatetime = customRange.untilDatetime;
  
  // Kiểm tra nếu sinceDatetime là ngày quá cũ (trước năm 1900)
  if (validatedSinceDatetime && validatedSinceDatetime.startsWith('17')) {
    console.warn('Invalid sinceDatetime detected:', validatedSinceDatetime, '- using yesterday');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    validatedSinceDatetime = yesterday.toISOString().split('T')[0] + 'T00:00:00';
  }
  
  // Kiểm tra nếu untilDatetime là ngày quá cũ
  if (validatedUntilDatetime && validatedUntilDatetime.startsWith('17')) {
    console.warn('Invalid untilDatetime detected:', validatedUntilDatetime, '- using today');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    validatedUntilDatetime = today.toISOString().split('T')[0] + 'T00:00:00';
  }
  
  // Đảm bảo luôn sử dụng mode "specific"
  const normalizedCustomRange = {
    ...customRange,
    sinceDatetime: validatedSinceDatetime,
    untilDatetime: validatedUntilDatetime,
    sinceMode: 'specific' as const,
    untilMode: 'specific' as const,
  };
  console.log('normalizedCustomRange.sinceDatetime:', normalizedCustomRange.sinceDatetime);
  
  if (!matchedFlag) {
    props.onChange(customTimeRangeEncode(normalizedCustomRange));
  }
  
  const {
    sinceDatetime,
    untilDatetime,
  } = normalizedCustomRange;

  function onChange(control: CustomRangeKey, value: string) {
    props.onChange(
      customTimeRangeEncode({
        ...normalizedCustomRange,
        [control]: value,
      }),
    );
  }

  if (datePickerLocale === null) {
    return <Loading position="inline-centered" />;
  }

  return (
    <AntdThemeProvider locale={datePickerLocale}>
      <div data-test="custom-frame">
        <div className="section-title">{t('Chọn khoảng thời gian')}</div>
        <Row gutter={24}>
          <Col span={12}>
            <div className="control-label">
              {t('Từ ngày')}{' '}
              <InfoTooltip
                tooltip={t('Ngày bắt đầu (bao gồm)')}
                placement="right"
              />
            </div>
            <Row>
              <DatePicker
                defaultValue={dttmToDayjs(sinceDatetime)}
                onChange={(datetime: Dayjs) =>
                  onChange('sinceDatetime', datetime.startOf('day').format(DAYJS_FORMAT))
                }
                allowClear={false}
                getPopupContainer={(triggerNode: HTMLElement) =>
                  props.isOverflowingFilterBar
                    ? (triggerNode.parentNode as HTMLElement)
                    : document.body
                }
              />
            </Row>
          </Col>
          <Col span={12}>
            <div className="control-label">
              {t('Đến ngày')}{' '}
              <InfoTooltip
                tooltip={t('Ngày kết thúc (không bao gồm)')}
                placement="right"
              />
            </div>
            <Row>
              <DatePicker
                defaultValue={dttmToDayjs(untilDatetime)}
                onChange={(datetime: Dayjs) =>
                  onChange('untilDatetime', datetime.startOf('day').format(DAYJS_FORMAT))
                }
                allowClear={false}
                getPopupContainer={(triggerNode: HTMLElement) =>
                  props.isOverflowingFilterBar
                    ? (triggerNode.parentNode as HTMLElement)
                    : document.body
                }
              />
            </Row>
          </Col>
        </Row>
      </div>
    </AntdThemeProvider>
  );
}

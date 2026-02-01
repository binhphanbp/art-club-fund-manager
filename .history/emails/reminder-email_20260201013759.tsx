import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ReminderEmailProps {
  memberName: string;
  currentWeek: number;
  departmentName: string;
}

export const ReminderEmail = ({
  memberName = 'Thành viên',
  currentWeek = 1,
  departmentName = 'Bộ môn',
}: ReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`🎭 CLB Nghệ Thuật - Nhắc nhở nộp quỹ tuần ${currentWeek}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Text style={headerEmoji}>🎭</Text>
            <Heading style={headerTitle}>CLB Nghệ Thuật</Heading>
            <Text style={headerSubtitle}>Nơi đam mê thăng hoa ✨</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={greeting}>Xin chào {memberName}! 👋</Heading>

            <Text style={paragraph}>
              Chúng mình nhận thấy bạn chưa nộp quỹ cho{' '}
              <strong>Tuần {currentWeek}</strong> của năm nay.
            </Text>

            <Section style={infoBox}>
              <Text style={infoBoxTitle}>📋 Thông tin nộp quỹ</Text>
              <Text style={infoItem}>
                <strong>Bộ môn:</strong> {departmentName}
              </Text>
              <Text style={infoItem}>
                <strong>Tuần:</strong> {currentWeek}
              </Text>
              <Text style={infoItem}>
                <strong>Số tiền:</strong> 50.000đ
              </Text>
            </Section>

            <Text style={paragraph}>
              Đóng quỹ đúng hạn giúp CLB có nguồn lực để tổ chức các hoạt động,
              sự kiện và phát triển cộng đồng nghệ thuật của chúng ta! 🎤🎸💃🎧
            </Text>

            <Section style={ctaSection}>
              <Link
                href="https://artclub.example.com/dashboard"
                style={ctaButton}
              >
                Nộp Quỹ Ngay 💰
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={bankInfo}>
              <Text style={bankInfoTitle}>🏦 Thông tin chuyển khoản</Text>
              <Text style={bankInfoItem}>
                <strong>Số tài khoản:</strong> 0123456789
              </Text>
              <Text style={bankInfoItem}>
                <strong>Ngân hàng:</strong> ABC Bank
              </Text>
              <Text style={bankInfoItem}>
                <strong>Chủ TK:</strong> CLB NGHE THUAT
              </Text>
              <Text style={bankInfoItem}>
                <strong>Nội dung:</strong> CLB NT - {memberName} - Tuan{' '}
                {currentWeek}
              </Text>
            </Section>

            <Text style={note}>
              💡 Sau khi chuyển khoản, hãy vào app và upload ảnh chứng minh nhé!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Made with ❤️ by CLB Nghệ Thuật</Text>
            <Text style={footerLinks}>
              🎤 Singing • 💃 Dancing • 🎧 Rap • 🎸 Instruments
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReminderEmail;

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#0a0a0a',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  borderRadius: '16px 16px 0 0',
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const headerEmoji = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '16px',
  margin: '0',
};

const content = {
  backgroundColor: '#18181b',
  padding: '32px 24px',
};

const greeting = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
};

const paragraph = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px 0',
};

const infoBox = {
  backgroundColor: '#27272a',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  borderLeft: '4px solid #a855f7',
};

const infoBoxTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoItem = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '8px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#7c3aed',
  borderRadius: '12px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#27272a',
  margin: '32px 0',
};

const bankInfo = {
  backgroundColor: '#1e3a5f',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const bankInfoTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const bankInfoItem = {
  color: '#93c5fd',
  fontSize: '14px',
  margin: '8px 0',
};

const note = {
  color: '#fbbf24',
  fontSize: '14px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
};

const footer = {
  backgroundColor: '#09090b',
  borderRadius: '0 0 16px 16px',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const footerLinks = {
  color: '#52525b',
  fontSize: '12px',
  margin: '0',
};

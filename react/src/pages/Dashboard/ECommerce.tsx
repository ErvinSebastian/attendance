import React, { useEffect, useState } from 'react';
import CardDataStats from '../../components/CardDataStats';
import TableOne from '../../components/Tables/TableOne';
import DefaultLayout from '../../layout/DefaultLayout';
import userService from '../../services/user-service';
import CardDataUserStats from '../../components/CardDataUserStats';
import { styled, alpha } from '@mui/material/styles';
import { ViewState } from '@devexpress/dx-react-scheduler';
import Paper from '@mui/material/Paper';
import {
  Scheduler,
  WeekView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';

const currentDate = new Date();

interface UserDataType {
  id: number;
  course_name: string;
  course_type_id: number;
  email: string;
  password: string;
  name: string;
}

interface ClassType {
  id: number;
  subject_name: string;
  subject_type_id: number;
  name: string;
  total_present: number;
  total_late: number;
}

interface TopStudentType {
  name: string;
  total: number;
}

const PREFIX = 'Demo';

const classes = {
  todayCell: `${PREFIX}-todayCell`,
  weekendCell: `${PREFIX}-weekendCell`,
  today: `${PREFIX}-today`,
  weekend: `${PREFIX}-weekend`,
};

const StyledWeekViewTimeTableCell = styled(WeekView.TimeTableCell)(
  ({ theme }) => ({
    [`&.${classes.todayCell}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.14),
      },
      '&:focus': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },
    [`&.${classes.weekendCell}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      '&:hover': {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
      '&:focus': {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
    },
  }),
);

const StyledWeekViewDayScaleCell = styled(WeekView.DayScaleCell)(
  ({ theme }) => ({
    [`&.${classes.today}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
    [`&.${classes.weekend}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.06),
    },
  }),
);

const TimeTableCell = (props) => {
  const { startDate } = props;
  const date = new Date(startDate);

  if (date.getDate() === new Date().getDate()) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.todayCell} />
    );
  }
  if (date.getDay() === 0 || date.getDay() === 6) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.weekendCell} />
    );
  }
  return <StyledWeekViewTimeTableCell {...props} />;
};

const DayScaleCell = (props) => {
  const { startDate, today } = props;
  if (today) {
    return <StyledWeekViewDayScaleCell {...props} className={classes.today} />;
  }
  if (startDate.getDay() === 0 || startDate.getDay() === 6) {
    return (
      <StyledWeekViewDayScaleCell {...props} className={classes.weekend} />
    );
  }
  return <StyledWeekViewDayScaleCell {...props} />;
};

const ECommerce: React.FC = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [summary, setSummary] = useState<ClassType[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudentType[]>([]);
  const [schedules, setSchedules] = useState([]);
  const [approvedAccounts, setApprovedAccounts] = useState(0);
  const [unapprovedAccounts, setUnapprovedAccounts] = useState(0);
  useEffect(() => {
    initialize(user);
  }, []);

  useEffect(() => {}, [topStudents]);

  const getSummary = (user: UserDataType) => {
    return userService.getUserSummary(user).then((res) => {
      return res.data;
    });
  };

  const getSchedules = (user: UserDataType) => {
    return userService.getSchedules(user).then((res) => {
      return res.data;
    });
  };

  const initialize = async (user: UserDataType) => {
    const summaryResponse = await getSummary(user);
    const scheduleResponse = await getSchedules(user);
    if (summaryResponse.subjects) {
      setSummary(summaryResponse.subjects);
    }

    if (summaryResponse.top_students) {
      setTopStudents(summaryResponse.top_students);
    }
    if (summaryResponse.no_of_approved_accounts) {
      setApprovedAccounts(summaryResponse.no_of_approved_accounts);
    }

    if (summaryResponse.no_of_unapproved_accounts) {
      setUnapprovedAccounts(summaryResponse.no_of_unapproved_accounts);
    }
    if (scheduleResponse.length > 0 && scheduleResponse) {
      setSchedules(scheduleResponse);
    }
  };
  return (
    <DefaultLayout>
      {user.user_type_name != 'admin' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          {summary.length > 0
            ? summary.map((s) => {
                return (
                  <CardDataStats
                    title={s.subject_name}
                    totalPresent={
                      s.total_present ? s.total_present.toString() : '0'
                    }
                    totalLate={s.total_late ? s.total_late.toString() : '0'}
                  ></CardDataStats>
                );
              })
            : ''}
        </div>
      ) : (
        ''
      )}

      {user.user_type_name == 'admin' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          {
            <CardDataUserStats
              title="Accounts Summary"
              totalApproved={
                approvedAccounts ? approvedAccounts.toString() : '0'
              }
              totalUnapproved={
                unapprovedAccounts ? unapprovedAccounts.toString() : '0'
              }
            ></CardDataUserStats>
          }
        </div>
      ) : (
        ''
      )}
      <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <Paper>
            <Scheduler data={schedules} height={660}>
              <ViewState defaultCurrentDate={currentDate} />
              <WeekView
                startDayHour={5}
                endDayHour={21}
                timeTableCellComponent={TimeTableCell}
                dayScaleCellComponent={DayScaleCell}
              />
              <Appointments />
            </Scheduler>
          </Paper>
        </div>
        <div className="col-span-12 xl:col-span-8">
          <TableOne topStudents={topStudents} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ECommerce;

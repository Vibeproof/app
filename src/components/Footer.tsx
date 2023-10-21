import { createStyles, Container, Group, ActionIcon, rem } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconBrandTelegram, IconBrandDiscord } from '@tabler/icons-react';
import { MantineLogo } from '@mantine/ds';
import Logo from './Logo';

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: rem(120),
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column',
    },
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      marginTop: theme.spacing.md,
    },
  },
}));

export default function Footer() {
  const { classes } = useStyles();

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group spacing={0} className={classes.links} position="right" noWrap>
          <ActionIcon size="lg" component='a' target='_blank' href="https://twitter.com/potekhin_sergey">
            <IconBrandTwitter size="1.05rem" stroke={1.5} />
          </ActionIcon>
          {/* <ActionIcon size="lg">
            <IconBrandTelegram size="1.05rem" stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg">
            <IconBrandDiscord size="1.05rem" stroke={1.5} />
          </ActionIcon> */}
        </Group>
      </Container>
    </div>
  );
}

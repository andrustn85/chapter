import { prisma } from '../../../src/prisma';

import { ChapterPermission } from '../../../../common/permissions';

const chapterPermissions = Object.values(ChapterPermission);

const roles: Array<{
  name: string;
  permissions: readonly ChapterPermission[];
}> = [
  {
    name: 'administrator',
    permissions: Object.values(ChapterPermission),
  },
  {
    name: 'member',
    permissions: [
      ChapterPermission.Rsvp,
      ChapterPermission.EventSubscriptionsManage,
    ],
  },
];

const createChapterRoles = async () => {
  await prisma.chapter_permissions.createMany({
    data: chapterPermissions.map((permission) => ({ name: permission })),
  });

  return (
    await Promise.all(
      roles.map(
        async ({ name, permissions }) =>
          await prisma.chapter_roles.create({
            data: {
              name: name,
              chapter_role_permissions: {
                create: permissions.map((permission) => ({
                  chapter_permission: {
                    connect: {
                      name: permission,
                    },
                  },
                })),
              },
            },
          }),
      ),
    )
  )
    .map((role) => ({ [role.name]: { name: role.name, id: role.id } }))
    .reduce((acc, curr) => ({
      ...acc,
      ...curr,
    }));
};

export default createChapterRoles;

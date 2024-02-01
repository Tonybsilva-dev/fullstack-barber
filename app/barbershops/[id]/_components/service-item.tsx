"use client";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Barbershop, Service } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { GenerateDayTimeList } from "../_helpers/hours";
import { formatCurrencyToBRL } from "../_helpers/format";
import { format, setHours, setMinutes } from "date-fns";
import { saveBookings } from "../_actions/save-booking";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ServiceItemProps {
  barberShop: Barbershop;
  service: Service;
  isAuthenticated: boolean;
}

const ServiceItem = ({
  service,
  isAuthenticated,
  barberShop,
}: ServiceItemProps) => {
  const { data } = useSession();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>();
  const [submitIsLoading, setSubmitIsLoading] = useState<boolean>(false);
  const [sheetsIsOpen, setSheetIsOpen] = useState<boolean>(false);

  const handleBookingSubmit = async () => {
    setSubmitIsLoading(true);
    if (!hour || !date || !data?.user) return;

    try {
      const dateHour = Number(hour.split(":")[0]);
      const dateMinutes = Number(hour.split(":")[1]);

      const newDate = setMinutes(setHours(date, dateHour), dateMinutes);

      await saveBookings({
        serviceId: service.id,
        barbershopId: barberShop.id,
        date: newDate,
        userId: (data.user as any).id,
      });

      toast("Reserva realizada com sucesso!", {
        description: format(newDate, "'para' dd 'de' MMMM 'ás' HH':'mm'.'", {
          locale: ptBR,
        }),
        action: {
          label: "Visualizar",
          onClick: () => console.log("Saved"),
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitIsLoading(false);
      setSheetIsOpen(false);
      setHour(undefined)
      setDate(undefined)
    }
  };

  const handleDateClick = (date: Date | undefined) => {
    setDate(date);
    setHour(undefined);
  };

  const handleHourClick = (time: string) => {
    setHour(time);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      return signIn("google");
    }

    // TODO: abrir modal de agendamento
  };

  const timeList = useMemo(() => {
    return date ? GenerateDayTimeList(date) : [];
  }, [date]);

  return (
    <Card>
      <CardContent className="p-3 w-full">
        <div className="flex gap-4 items-center w-full">
          <div className="relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
            <Image
              className="rounded-lg"
              src={service.imageUrl}
              fill
              style={{ objectFit: "contain" }}
              alt={service.name}
            />
          </div>

          <div className="flex flex-col w-full">
            <h2 className="font-bold">{service.name}</h2>
            <p className="text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between mt-3">
              <p className="text-primary text-sm font-bold">
                {formatCurrencyToBRL(Number(service.price))}
              </p>

              <Sheet open={sheetsIsOpen} onOpenChange={setSheetIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" onClick={handleBookingClick}>
                    Reservar
                  </Button>
                </SheetTrigger>
                <SheetContent className="p-0 overflow-y-auto">
                  <SheetHeader className="px-5 py-6 border-b border-solid border-secondary">
                    <SheetTitle>Fazer reserva</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateClick}
                      fromDate={new Date()}
                      locale={ptBR}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {date && (
                    <div className="flex gap-3 py-6 px-5 border-t border-solid border-secondary overflow-x-auto [&::-webkit-scrollbar]:hidden">
                      {timeList.map((time) => (
                        <Button
                          onClick={() => handleHourClick(time)}
                          variant={hour === time ? "default" : "outline"}
                          className="rounded-full"
                          key={time}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="py-6 px-5 border-t border-solid border-secondary">
                    <Card>
                      <CardContent className="flex flex-col p-3 gap-3">
                        <div className="flex justify-between">
                          <h2 className="font-bold">{service.name}</h2>
                          <h3 className="font-bold text-sm">
                            {formatCurrencyToBRL(Number(service.price))}
                          </h3>
                        </div>

                        {date && (
                          <div className="flex justify-between">
                            <h3 className="text-gray-400">Data</h3>
                            <h4 className="text-sm capitalize">
                              {format(date, "dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </h4>
                          </div>
                        )}

                        {hour && (
                          <div className="flex justify-between">
                            <h3 className="text-gray-400">Hora</h3>
                            <h4 className="text-sm capitalize">{hour}</h4>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <h3 className="text-gray-400">Barbearia</h3>
                          <h4 className="text-sm capitalize">
                            {barberShop.name}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <SheetFooter className="px-5 mb-5">
                    <Button
                      onClick={handleBookingSubmit}
                      disabled={!hour || !date || submitIsLoading}
                    >
                      {submitIsLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {!submitIsLoading && "Confirmar reserva"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
